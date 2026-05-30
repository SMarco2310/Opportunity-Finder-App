"""Deduplicate candidates against existing opportunities via Convex vector search."""

from __future__ import annotations

import logging
from dataclasses import dataclass

from .convex_client import ConvexBackend
from .models import OpportunityRecord

logger = logging.getLogger(__name__)

SIMILARITY_THRESHOLD = 0.92


@dataclass
class DedupeResult:
    inserted: int = 0
    merged: int = 0


class Deduper:
    def __init__(self, backend: ConvexBackend, threshold: float = SIMILARITY_THRESHOLD):
        self._backend = backend
        self._threshold = threshold

    def process(self, records: list[OpportunityRecord]) -> DedupeResult:
        result = DedupeResult()
        for rec in records:
            matches = self._backend.find_similar(
                embedding=rec.embedding, category=rec.category, limit=3
            )
            top = max(matches, key=lambda m: m["score"], default=None)
            if top and top["score"] >= self._threshold:
                self._backend.add_mirror_url(top["id"], rec.applyUrl)
                result.merged += 1
                logger.info(
                    "dedupe.merge",
                    extra={
                        "title": rec.title,
                        "into": top["id"],
                        "score": round(top["score"], 4),
                    },
                )
            else:
                opp_id = self._backend.insert(rec.to_convex())
                result.inserted += 1
                logger.info(
                    "dedupe.insert", extra={"title": rec.title, "id": opp_id}
                )
        return result
