# Opportunity Finder — Scraper

Python 3.12 pipeline: fetch (Crawl4AI) → extract (Claude) → enrich (categorize +
OpenAI embeddings) → dedupe (Convex vector search) → write (Convex mutations).

```bash
uv sync                              # install deps
cp ../.env.example .env              # fill CONVEX_*, ANTHROPIC_API_KEY, OPENAI_API_KEY
uv run python scripts/seed.py        # seed 20 opportunities (Step 3)
uv run python -m src.pipeline --source anpetogo   # run one source (Step 9)
uv run python -m src.pipeline --all               # run all sources (Step 10)
```

Run `uv run mypy src/` before declaring a step done.
