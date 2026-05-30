"""Environment configuration for the scraper."""

from __future__ import annotations

import os
from dataclasses import dataclass

from dotenv import load_dotenv

load_dotenv()


@dataclass(frozen=True)
class Settings:
    convex_url: str
    convex_admin_key: str
    anthropic_api_key: str
    openai_api_key: str
    # Models
    extract_model: str = "claude-haiku-4-5"
    extract_model_hard: str = "claude-sonnet-4-6"
    embed_model: str = "text-embedding-3-small"
    embed_dim: int = 1536

    @staticmethod
    def load() -> "Settings":
        def req(name: str) -> str:
            val = os.environ.get(name, "").strip()
            if not val:
                raise RuntimeError(f"Variable d'environnement manquante: {name}")
            return val

        return Settings(
            convex_url=req("CONVEX_URL"),
            convex_admin_key=req("CONVEX_ADMIN_KEY"),
            anthropic_api_key=req("ANTHROPIC_API_KEY"),
            openai_api_key=req("OPENAI_API_KEY"),
        )
