# Opportunity Finder

Mobile-native app (Android-first) helping Togolese youth (18–35) discover
scholarships, internships, fellowships, grants and other opportunities. A Python
scraper uses an LLM to extract structured opportunity data from a curated list of
sources and writes into Convex. The mobile app reads from Convex with real-time
sync and serves a personalized feed ranked by deadline urgency and user interests.
Reminders go out via WhatsApp and push 3 days before a saved opportunity's deadline.

> Opportunity access in Togo is gated by personal connections. This app levels the
> playing field with timely, personalized notifications.

## Monorepo layout

```
apps/mobile/   Expo (React Native) app — Expo Router, NativeWind, Convex client
apps/mobile/convex/   Convex backend (schema, queries, mutations, actions, crons)
scraper/       Python 3.12 scraper (Crawl4AI + Claude + OpenAI embeddings → Convex)
docs/          Product brief, design language, architecture diagrams
.github/workflows/   Daily scraper cron
```

## Stack

| Layer | Choice |
|---|---|
| Mobile | Expo SDK 56 (RN) + TypeScript + Expo Router |
| Styling | NativeWind v4 (Tailwind for RN) |
| UI state | Zustand (server state lives in Convex hooks) |
| Backend + DB | Convex (real-time sync, crons, vector search) |
| Auth | Clerk (phone OTP, +228 only for MVP) |
| Scraper | Python 3.12 + Crawl4AI + Claude Haiku/Sonnet |
| Embeddings | OpenAI text-embedding-3-small (1536-dim) |
| WhatsApp | Twilio WhatsApp API |
| Push | Expo Push Notifications |
| Build | EAS Build/Submit → Google Play internal track |

## Prerequisites

- **Node** ≥ 20 and **pnpm** (`npm i -g pnpm`)
- **uv** (Python package manager — `curl -LsSf https://astral.sh/uv/install.sh | sh`)
- **Expo CLI** (`npx expo`) and **Convex CLI** (`npx convex`)
- An **Android device** (Expo Go) or emulator — target users run Tecno/Infinix/Itel
- Accounts: Convex, Clerk, Anthropic, OpenAI, Twilio, Expo/EAS, Google Play

## Setup

```bash
# 1. Install JS deps (root pnpm workspace)
pnpm install

# 2. Mobile env + Convex dev backend
cd apps/mobile
cp ../../.env.example .env.local      # fill in EXPO_PUBLIC_* values
npx convex dev                        # provisions a dev deployment, writes CONVEX_URL

# 3. Run the app (separate terminal)
pnpm start                            # LAN: scan QR with Expo Go (same Wi‑Fi as laptop)
pnpm --filter mobile start:tunnel     # only if LAN fails (needs @expo/ngrok — see apps/mobile/lib/dev/preview.ts)
pnpm --filter mobile web              # browser preview (layout only, not full native behavior)

# 4. Scraper env
cd ../../scraper
uv sync
cp ../.env.example .env               # fill in CONVEX_*, ANTHROPIC, OPENAI keys
uv run python scripts/seed.py         # seed 20 opportunities
```

## Conventions

- All sensitive logic lives **inside Convex functions**, enforced via `ctx.auth`.
- Client-uncallable logic (seed, scraper inserts, reminders) uses **internal** Convex functions.
- Server state goes through Convex `useQuery`/`useMutation` — no TanStack Query, no `useEffect`+fetch.
- No `any` in TypeScript — import generated types from `convex/_generated`.
- All user-facing strings in French via `apps/mobile/lib/i18n/fr.ts`.
- Run `pnpm typecheck && pnpm lint` (mobile) and `uv run mypy src/` (scraper) before declaring a step done.
- Never commit secrets — `.env*` is gitignored except `.env.example`.

See [`PLAN.md`](./PLAN.md) for the full build plan.
