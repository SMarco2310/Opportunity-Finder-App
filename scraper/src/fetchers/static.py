"""Static fetcher using Crawl4AI — returns clean markdown for an URL."""

from __future__ import annotations

import logging

from crawl4ai import AsyncWebCrawler

logger = logging.getLogger(__name__)


async def fetch_markdown(url: str) -> str:
    """Crawl a single URL and return its markdown body."""
    logger.info("fetch.start", extra={"url": url})
    async with AsyncWebCrawler() as crawler:
        result = await crawler.arun(url=url)

    # Crawl4AI's `markdown` is either a str or a MarkdownGenerationResult.
    markdown = getattr(result, "markdown", "")
    if markdown and not isinstance(markdown, str):
        markdown = getattr(markdown, "raw_markdown", "") or str(markdown)

    if not markdown:
        logger.warning("fetch.empty", extra={"url": url})
    else:
        logger.info("fetch.ok", extra={"url": url, "chars": len(markdown)})
    return markdown or ""


async def fetch_many(urls: list[str]) -> dict[str, str]:
    """Fetch several URLs, returning {url: markdown}. Reuses one crawler."""
    out: dict[str, str] = {}
    async with AsyncWebCrawler() as crawler:
        for url in urls:
            logger.info("fetch.start", extra={"url": url})
            result = await crawler.arun(url=url)
            markdown = getattr(result, "markdown", "")
            if markdown and not isinstance(markdown, str):
                markdown = getattr(markdown, "raw_markdown", "") or str(markdown)
            out[url] = markdown or ""
    return out
