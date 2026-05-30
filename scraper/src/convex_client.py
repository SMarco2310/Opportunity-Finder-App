"""Thin wrapper around the Convex Python SDK.

Holds the deployment URL + admin key and exposes typed helpers for the
mutations/queries/actions the scraper needs. The admin key lets us call
`internal` Convex functions (seed, insert, dedupe) that clients cannot.
"""

from __future__ import annotations

from typing import Any, cast

from convex import ConvexClient

from .config import Settings


class ConvexBackend:
    def __init__(self, settings: Settings) -> None:
        self._client = ConvexClient(settings.convex_url)
        # Admin auth unlocks internal functions for server-side scripts.
        self._client.set_admin_auth(settings.convex_admin_key)

    # --- sources -----------------------------------------------------------
    def seed_sources(self, sources: list[dict[str, Any]]) -> dict[str, int]:
        return cast(
            dict[str, int],
            self._client.mutation("sources:seedSources", {"sources": sources}),
        )

    def source_id_by_url(self, url: str) -> str | None:
        return cast(
            "str | None",
            self._client.mutation("sources:getIdByUrl", {"url": url}),
        )

    def mark_scraped(self, source_id: str, processed: int) -> None:
        self._client.mutation(
            "sources:markScraped",
            {"sourceId": source_id, "opportunitiesProcessed": processed},
        )

    # --- opportunities -----------------------------------------------------
    def bulk_insert(self, opportunities: list[dict[str, Any]]) -> dict[str, int]:
        return cast(
            dict[str, int],
            self._client.mutation(
                "opportunities:bulkInsert", {"opportunities": opportunities}
            ),
        )

    def insert(self, opportunity: dict[str, Any]) -> str:
        return cast(
            str,
            self._client.mutation(
                "opportunities:insert", {"opportunity": opportunity}
            ),
        )

    def add_mirror_url(self, opportunity_id: str, url: str) -> None:
        self._client.mutation(
            "opportunities:addMirrorUrl",
            {"opportunityId": opportunity_id, "url": url},
        )

    def find_similar(
        self, embedding: list[float], category: str, limit: int = 3
    ) -> list[dict[str, Any]]:
        return cast(
            list[dict[str, Any]],
            self._client.action(
                "opportunities:findSimilar",
                {"embedding": embedding, "category": category, "limit": limit},
            ),
        )
