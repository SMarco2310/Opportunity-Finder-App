"""Extract structured opportunities from markdown using Claude."""

from __future__ import annotations

import json
import logging
import re

from anthropic import Anthropic
from pydantic import ValidationError

from .config import Settings
from .models import RawOpportunity

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """Tu es un extracteur de données pour une application qui aide \
les jeunes Togolais (18-35 ans) à trouver des opportunités (bourses, emplois, \
fellowships, subventions, concours, formations, événements, bénévolat).

À partir du contenu Markdown d'une page web, extrais TOUTES les opportunités \
réelles et actuelles. Réponds UNIQUEMENT avec un tableau JSON valide, sans texte \
autour, sans bloc de code.

Chaque élément doit avoir EXACTEMENT ces clés :
- "title": titre court et clair (string)
- "description": résumé de 2-4 phrases (string, en français)
- "category": une de ["scholarships","jobs","fellowships","grants","contests","training","events","volunteer"]
- "deadline_iso": date limite au format ISO "YYYY-MM-DD". Si inconnue, mets la date dans 30 jours.
- "geographic_scope": ex "Togo", "Afrique de l'Ouest", "International"
- "funding_level": une de ["fully_funded","partial","unfunded","unknown"]
- "education_level_min": niveau requis ou null (ex "Licence", "Bac", "Master")
- "field_tags": liste de domaines (ex ["informatique","santé"]) ou []
- "language": "fr" ou "en"
- "format": "online", "in_person", "hybrid" ou null
- "duration": ex "6 mois" ou null
- "age_min": entier ou null
- "age_max": entier ou null
- "apply_url": URL exacte pour postuler (string, obligatoire)

Si la page ne contient aucune opportunité, réponds avec un tableau vide [].
N'invente jamais d'URL : utilise les liens présents dans le contenu."""


def _strip_code_fence(text: str) -> str:
    text = text.strip()
    fence = re.match(r"^```(?:json)?\s*(.*?)\s*```$", text, re.DOTALL)
    return fence.group(1).strip() if fence else text


class Extractor:
    def __init__(self, settings: Settings) -> None:
        self._client = Anthropic(api_key=settings.anthropic_api_key)
        self._model = settings.extract_model

    def extract(self, markdown: str, page_url: str) -> list[RawOpportunity]:
        if not markdown.strip():
            return []

        # Cap input to keep token use bounded.
        content = markdown[:24000]
        user = (
            f"URL de la page : {page_url}\n\n"
            f"Contenu Markdown :\n\n{content}"
        )

        msg = self._client.messages.create(
            model=self._model,
            max_tokens=4096,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": user}],
        )

        block = msg.content[0]
        raw_text = getattr(block, "text", "")
        payload = _strip_code_fence(raw_text)

        try:
            items = json.loads(payload)
        except json.JSONDecodeError:
            logger.error("extract.bad_json", extra={"url": page_url})
            return []

        if not isinstance(items, list):
            logger.error("extract.not_list", extra={"url": page_url})
            return []

        results: list[RawOpportunity] = []
        for item in items:
            try:
                results.append(RawOpportunity.model_validate(item))
            except ValidationError as exc:
                logger.warning(
                    "extract.invalid_item",
                    extra={"url": page_url, "error": str(exc)},
                )
        logger.info(
            "extract.ok", extra={"url": page_url, "count": len(results)}
        )
        return results
