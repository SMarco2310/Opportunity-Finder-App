"""Seed Convex with hand-curated opportunities so the UI has data pre-scraper.

    uv run python scripts/seed.py

Reads scripts/seed_data.json, generates OpenAI embeddings, then calls the
internal mutations sources:seedSources and opportunities:bulkInsert.
"""

from __future__ import annotations

import json
import logging
from pathlib import Path

from src.config import Settings
from src.convex_client import ConvexBackend
from src.enricher import Enricher, deadline_to_ms
from src.logging_config import configure_logging
from src.models import OpportunityRecord, slugify

logger = logging.getLogger("seed")

FIXTURE = Path(__file__).parent / "seed_data.json"


def build_records(raw_opps: list[dict[str, object]], enricher: Enricher) -> list[dict[str, object]]:
    texts = [
        f"{o['title']}\n{o['description']}\nCatégorie: {o['category']}\n"
        f"Domaines: {', '.join(o.get('field_tags', []))}"  # type: ignore[arg-type]
        for o in raw_opps
    ]
    vectors = enricher.embed(texts)

    records: list[dict[str, object]] = []
    for o, vec in zip(raw_opps, vectors, strict=True):
        rec = OpportunityRecord(
            sourceUrl=str(o["source_url"]),
            title=str(o["title"]),
            slug=slugify(str(o["title"])),
            description=str(o["description"]),
            category=o["category"],  # type: ignore[arg-type]
            deadlineAt=deadline_to_ms(str(o["deadline_iso"])),
            geographicScope=str(o.get("geographic_scope", "Togo")),
            fundingLevel=o.get("funding_level", "unknown"),  # type: ignore[arg-type]
            educationLevelMin=o.get("education_level_min"),  # type: ignore[arg-type]
            fieldTags=list(o.get("field_tags", [])),  # type: ignore[arg-type]
            language=o.get("language", "fr"),  # type: ignore[arg-type]
            format=o.get("format"),  # type: ignore[arg-type]
            duration=o.get("duration"),  # type: ignore[arg-type]
            ageMin=o.get("age_min"),  # type: ignore[arg-type]
            ageMax=o.get("age_max"),  # type: ignore[arg-type]
            applyUrl=str(o["apply_url"]),
            embedding=vec,
        )
        records.append(rec.to_convex())
    return records


def main() -> None:
    configure_logging()
    settings = Settings.load()
    backend = ConvexBackend(settings)
    enricher = Enricher(settings)

    data = json.loads(FIXTURE.read_text(encoding="utf-8"))
    sources = data["sources"]
    raw_opps = data["opportunities"]

    src_result = backend.seed_sources(sources)
    logger.info("seed.sources", extra=src_result)

    records = build_records(raw_opps, enricher)
    opp_result = backend.bulk_insert(records)
    logger.info("seed.opportunities", extra=opp_result)
    logger.info(
        "seed.done",
        extra={"sources": len(sources), "opportunities": len(records)},
    )


if __name__ == "__main__":
    main()
