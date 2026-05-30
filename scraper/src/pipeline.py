"""Scraper pipeline: fetch → extract → enrich → dedupe → write to Convex.

Usage:
    uv run python -m src.pipeline --source anpetogo
    uv run python -m src.pipeline --all
"""

from __future__ import annotations

import argparse
import asyncio
import logging

from .config import Settings
from .convex_client import ConvexBackend
from .deduper import Deduper
from .enricher import Enricher
from .extractor import Extractor
from .fetchers.static import fetch_many
from .logging_config import configure_logging
from .models import OpportunityRecord
from .sources.loader import SourceConfig, load_all_sources, load_source

logger = logging.getLogger("pipeline")


async def run_source(
    config: SourceConfig,
    backend: ConvexBackend,
    extractor: Extractor,
    enricher: Enricher,
    deduper: Deduper,
) -> int:
    logger.info("source.start", extra={"source": config.slug})

    # Ensure the source row exists (idempotent) and resolve its id.
    backend.seed_sources([config.to_convex_source()])
    source_id = backend.source_id_by_url(config.url)

    pages = await fetch_many(config.listing_urls)

    all_records: list[OpportunityRecord] = []
    for url, markdown in pages.items():
        raws = extractor.extract(markdown, url)
        records = enricher.enrich(raws, source_url=config.url)
        all_records.extend(records)

    result = deduper.process(all_records)

    if source_id:
        backend.mark_scraped(source_id, result.inserted + result.merged)

    logger.info(
        "source.done",
        extra={
            "source": config.slug,
            "candidates": len(all_records),
            "inserted": result.inserted,
            "merged": result.merged,
        },
    )
    return result.inserted


async def main_async(sources: list[SourceConfig]) -> None:
    settings = Settings.load()
    backend = ConvexBackend(settings)
    extractor = Extractor(settings)
    enricher = Enricher(settings)
    deduper = Deduper(backend)

    total = 0
    for config in sources:
        try:
            total += await run_source(config, backend, extractor, enricher, deduper)
        except Exception:
            logger.exception("source.error", extra={"source": config.slug})
    logger.info("pipeline.done", extra={"sources": len(sources), "inserted": total})


def main() -> None:
    parser = argparse.ArgumentParser(description="Opportunity Finder scraper")
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--source", help="source slug, e.g. anpetogo")
    group.add_argument("--all", action="store_true", help="run all enabled sources")
    args = parser.parse_args()

    configure_logging()
    sources = load_all_sources() if args.all else [load_source(args.source)]
    asyncio.run(main_async(sources))


if __name__ == "__main__":
    main()
