"""Deduplicate candidates against existing opportunities via Convex vector search."""

from __future__ import annotations

import logging
import math
from dataclasses import dataclass

from .convex_client import ConvexBackend
from .models import OpportunityRecord

logger = logging.getLogger(__name__)

SIMILARITY_THRESHOLD = 0.92


def _cosine(a: list[float], b: list[float]) -> float:
    """Cosine similarity of two equal-length vectors; 0.0 if either is zero."""
    dot = sum(x * y for x, y in zip(a, b, strict=True))
    na = math.sqrt(sum(x * x for x in a))
    nb = math.sqrt(sum(y * y for y in b))
    if na == 0.0 or nb == 0.0:
        return 0.0
    return dot / (na * nb)


@dataclass
class _Inserted:
    """An opportunity inserted earlier in this same run."""

    id: str
    embedding: list[float]


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
        # Track rows inserted during THIS run. Convex's vector index can lag a
        # just-committed insert, so two near-identical candidates in one batch
        # (e.g. the same listing on two pages) would both miss find_similar and
        # double-insert. Comparing against this in-run set closes that gap.
        seen: list[_Inserted] = []

        for rec in records:
            # 1) In-run match (deterministic, no index-lag window).
            local = max(
                ((_cosine(rec.embedding, s.embedding), s.id) for s in seen),
                key=lambda pair: pair[0],
                default=(0.0, ""),
            )
            if local[0] >= self._threshold:
                self._backend.add_mirror_url(local[1], rec.applyUrl)
                result.merged += 1
                logger.info(
                    "dedupe.merge_local",
                    extra={"title": rec.title, "into": local[1], "score": round(local[0], 4)},
                )
                continue

            # 2) Match against already-persisted opportunities.
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
                seen.append(_Inserted(id=opp_id, embedding=rec.embedding))
                result.inserted += 1
                logger.info(
                    "dedupe.insert", extra={"title": rec.title, "id": opp_id}
                )
        return result
