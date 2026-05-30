"""Pydantic models shared across the scraper pipeline.

These mirror `apps/mobile/convex/validators.ts::opportunityInput` so the payload
sent to Convex matches the backend validator exactly.
"""

from __future__ import annotations

import re
import unicodedata
from typing import Literal, Optional

from pydantic import BaseModel, Field, field_validator

Category = Literal[
    "scholarships",
    "jobs",
    "fellowships",
    "grants",
    "contests",
    "training",
    "events",
    "volunteer",
]

FundingLevel = Literal["fully_funded", "partial", "unfunded", "unknown"]
Language = Literal["fr", "en"]


def slugify(text: str) -> str:
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    text = re.sub(r"[^a-zA-Z0-9]+", "-", text).strip("-").lower()
    return text[:80] or "opportunite"


class RawOpportunity(BaseModel):
    """Structured opportunity as returned by the extractor LLM (no embedding)."""

    title: str
    description: str
    category: Category
    deadline_iso: str = Field(description="ISO 8601 date, e.g. 2026-08-15")
    geographic_scope: str = "Togo"
    funding_level: FundingLevel = "unknown"
    education_level_min: Optional[str] = None
    field_tags: list[str] = Field(default_factory=list)
    language: Language = "fr"
    format: Optional[str] = None
    duration: Optional[str] = None
    age_min: Optional[int] = None
    age_max: Optional[int] = None
    apply_url: str

    @field_validator("field_tags", mode="before")
    @classmethod
    def _coerce_tags(cls, v: object) -> list[str]:
        # The LLM sometimes returns tags as a comma-joined string (or null)
        # instead of a JSON array — normalize every shape to list[str].
        if v is None:
            return []
        if isinstance(v, str):
            return [t.strip() for t in v.split(",") if t.strip()]
        if isinstance(v, (list, tuple)):
            return [str(t).strip() for t in v if str(t).strip()]
        return []


class OpportunityRecord(BaseModel):
    """Final record ready to POST to Convex (matches opportunityInput)."""

    sourceUrl: str
    title: str
    slug: str
    description: str
    category: Category
    deadlineAt: int  # epoch milliseconds
    geographicScope: str
    fundingLevel: FundingLevel
    educationLevelMin: Optional[str] = None
    fieldTags: list[str]
    language: Language
    format: Optional[str] = None
    duration: Optional[str] = None
    ageMin: Optional[int] = None
    ageMax: Optional[int] = None
    applyUrl: str
    mirrorUrls: list[str] = Field(default_factory=list)
    embedding: list[float]
    verified: bool = False
    status: Literal["draft", "published", "archived", "expired"] = "published"

    def to_convex(self) -> dict[str, object]:
        # Drop None optionals so they map to Convex v.optional(...) cleanly.
        data = self.model_dump()
        return {k: v for k, v in data.items() if v is not None}
