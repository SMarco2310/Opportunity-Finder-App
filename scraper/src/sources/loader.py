"""Load per-source YAML configs from this directory."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Literal

import yaml

SOURCES_DIR = Path(__file__).parent

SourceType = Literal["static", "dynamic", "api", "aggregator"]
ScrapeFrequency = Literal["daily", "weekly", "manual"]


@dataclass(frozen=True)
class SourceConfig:
    slug: str
    name: str
    url: str
    source_type: SourceType
    country: str
    scrape_frequency: ScrapeFrequency
    trust_score: float
    listing_urls: list[str]

    def to_convex_source(self) -> dict[str, object]:
        return {
            "name": self.name,
            "url": self.url,
            "sourceType": self.source_type,
            "country": self.country,
            "scrapeFrequency": self.scrape_frequency,
            "trustScore": self.trust_score,
        }


def load_source(slug: str) -> SourceConfig:
    path = SOURCES_DIR / f"{slug}.yaml"
    if not path.exists():
        raise FileNotFoundError(f"Config source introuvable: {path}")
    data = yaml.safe_load(path.read_text(encoding="utf-8"))
    return SourceConfig(
        slug=slug,
        name=data["name"],
        url=data["url"],
        source_type=data["source_type"],
        country=data.get("country", "TG"),
        scrape_frequency=data.get("scrape_frequency", "daily"),
        trust_score=float(data.get("trust_score", 0.5)),
        listing_urls=list(data.get("listing_urls", [])),
    )


def load_all_sources() -> list[SourceConfig]:
    slugs = sorted(p.stem for p in SOURCES_DIR.glob("*.yaml"))
    return [load_source(s) for s in slugs]
