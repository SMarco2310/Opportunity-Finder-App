"""Enrich raw opportunities: parse deadlines, slug, and embeddings."""

from __future__ import annotations

import logging
from datetime import datetime, timedelta, timezone

from openai import OpenAI

from .config import Settings
from .models import OpportunityRecord, RawOpportunity, slugify

logger = logging.getLogger(__name__)


def deadline_to_ms(deadline_iso: str) -> int:
    """Parse an ISO date (or datetime) to epoch ms at end-of-day UTC."""
    text = deadline_iso.strip()
    try:
        if len(text) <= 10:
            dt = datetime.strptime(text, "%Y-%m-%d").replace(
                hour=23, minute=59, second=59, tzinfo=timezone.utc
            )
        else:
            dt = datetime.fromisoformat(text)
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
    except ValueError:
        # Unparseable date: fall back to +30 days (mirrors the extractor prompt)
        # rather than "now", which would land before the feed's deadlineAt >= now
        # filter and make the opportunity invisible.
        logger.warning("enrich.bad_deadline", extra={"value": text})
        dt = datetime.now(timezone.utc) + timedelta(days=30)
    return int(dt.timestamp() * 1000)


def _embed_text(opp: RawOpportunity) -> str:
    tags = ", ".join(opp.field_tags)
    return f"{opp.title}\n{opp.description}\nCatégorie: {opp.category}\nDomaines: {tags}"


class Enricher:
    def __init__(self, settings: Settings) -> None:
        self._client = OpenAI(api_key=settings.openai_api_key)
        self._model = settings.embed_model

    def embed(self, texts: list[str]) -> list[list[float]]:
        if not texts:
            return []
        resp = self._client.embeddings.create(model=self._model, input=texts)
        return [d.embedding for d in resp.data]

    def enrich(
        self, raws: list[RawOpportunity], source_url: str
    ) -> list[OpportunityRecord]:
        if not raws:
            return []
        vectors = self.embed([_embed_text(r) for r in raws])
        records: list[OpportunityRecord] = []
        for raw, vec in zip(raws, vectors, strict=True):
            records.append(
                OpportunityRecord(
                    sourceUrl=source_url,
                    title=raw.title,
                    slug=slugify(raw.title),
                    description=raw.description,
                    category=raw.category,
                    deadlineAt=deadline_to_ms(raw.deadline_iso),
                    geographicScope=raw.geographic_scope,
                    fundingLevel=raw.funding_level,
                    educationLevelMin=raw.education_level_min,
                    fieldTags=raw.field_tags,
                    language=raw.language,
                    format=raw.format,
                    duration=raw.duration,
                    ageMin=raw.age_min,
                    ageMax=raw.age_max,
                    applyUrl=raw.apply_url,
                    embedding=vec,
                )
            )
        logger.info("enrich.ok", extra={"count": len(records)})
        return records
