# Opportunity Finder — Coding plan for Claude Code (Mobile native, Convex backend)

> **How to use this file**
> Pass this file to Claude Code as your project plan. Work through the steps **in order**. After each step, run the verification commands in that step's "Definition of done" section before moving to the next. Do not skip ahead. If a step fails verification, fix it before continuing.

---

## 0. Project context (always re-read this)

**Product:** A mobile-native app (Android-first, iOS later) that helps Togolese youth (18–35) discover scholarships, internships, fellowships, grants, and other opportunities. A Python scraper uses an LLM to extract structured opportunity data from a curated list of sources and writes into Convex. The mobile app reads from Convex with real-time sync, and serves a personalized feed ranked by deadline urgency and user interests. Notifications go out via WhatsApp and push.

**The core insight:** Opportunity access in Togo is currently gated by personal connections. Our job is to level that playing field with timely, personalized notifications.

**Primary user:** A 19–25-year-old in Lomé/Kara/Sokodé, French-speaking, smartphone-primary (Android dominates the Togo market), often on 3G/4G, active on WhatsApp.

**Reference documents in this repo (read them, do not duplicate them):**
- `docs/project_brief.docx` — full product spec
- `docs/design_prompt.md` — UI design language and screen list
- `docs/diagrams/` — system architecture, ERD, user flow, sequence diagrams

---

## 1. Tech stack (locked — do not deviate without explicit approval)

| Layer | Choice | Rationale |
|---|---|---|
| Mobile framework | **Expo SDK 52+ (React Native)** + **TypeScript** | One codebase for iOS + Android, OTA updates, easy build pipeline |
| Routing | **Expo Router** (file-based) | Familiar pattern, type-safe links |
| Styling | **NativeWind v4** (Tailwind for RN) | Translates the design system 1:1 from web |
| State (UI only) | **Zustand** | Lightweight, no boilerplate. Server state lives in Convex hooks, not here |
| Backend + database | **Convex** | TypeScript-end-to-end, real-time sync, built-in scheduler and cron, vector search included |
| Backend functions | **Convex queries / mutations / actions** | Queries for reads, mutations for writes, actions for external API calls (Twilio, Expo Push) |
| Auth | **Clerk** (phone OTP via Twilio under the hood) integrated with Convex | Phone-first; Clerk has the most mature phone OTP support and clean Convex integration |
| Vector search | **Convex vector search** | Native to Convex, indexed embeddings, filter expressions supported |
| Real-time sync | **Convex sync engine** (built in) | Mobile feed updates instantly when scraper inserts a new opportunity |
| Scheduled jobs | **Convex crons** for reminder dispatch; **GitHub Actions** for the Python scraper | Convex crons run inside Convex (TS only); Python scraper still needs an external runner |
| Scraper runtime | **Python 3.12** (separate `scraper/` directory) | Best library support for crawling |
| Scraper → Convex | **`convex` Python SDK** (`pip install convex`) | Official client, talks to Convex mutations from Python |
| Fetcher | **Crawl4AI** | LLM-friendly markdown, Apache-2.0, free |
| LLM provider | **Anthropic Claude Haiku 4.5** for extraction; **Claude Sonnet 4.6** for hard parsing | Haiku is fast and cheap for the volume work |
| Embeddings | **OpenAI text-embedding-3-small** (1536-dim) | Cheapest reliable embedding model |
| WhatsApp | **Twilio WhatsApp API** (sandbox first, then approved sender) | Easiest path to a working bot |
| Push notifications | **Expo Push Notifications** | Built-in, free, works on both platforms |
| Build pipeline | **EAS Build** + **EAS Submit** | Standard for Expo apps |
| Distribution | **Google Play (internal track first)**, TestFlight later | Android-first for Togo market |
| Error tracking | **Sentry** (RN SDK + Python SDK) | Free tier covers MVP |
| Analytics | **PostHog** (React Native SDK) | Free tier, product analytics |
| Package manager | **pnpm** for JS, **uv** for Python | Fast, modern defaults |

**Required developer accounts (set up before you start):**
- Convex account (free tier)
- Clerk account (free tier covers up to 10,000 MAU — fine for MVP)
- Google Play Console account ($25 one-time)
- Expo / EAS account (free tier)
- Anthropic API key
- OpenAI API key (for embeddings)
- Twilio account (used by Clerk for OTP, and by us for WhatsApp)
- Apple Developer account ($99/yr) — SKIP for Android-only MVP

---

## 2. Repository structure (build this first)

```
opportunity-finder/
├── apps/
│   └── mobile/                   # Expo React Native app
│       ├── app/                  # Expo Router file-based routes
│       │   ├── (public)/         # Routes accessible without auth
│       │   ├── (auth)/           # Sign-in screen
│       │   ├── (tabs)/           # Bottom tab navigator
│       │   │   ├── index.tsx     # Home
│       │   │   ├── explore.tsx   # Browse
│       │   │   ├── saved.tsx     # Saved
│       │   │   ├── alerts.tsx    # Alerts
│       │   │   └── profile.tsx   # Profile
│       │   ├── opportunity/[id].tsx
│       │   └── _layout.tsx
│       ├── components/
│       │   ├── ui/               # Buttons, inputs, primitives
│       │   ├── cards/            # OpportunityCard, etc.
│       │   └── layout/
│       ├── convex/               # Convex backend lives here (Convex convention)
│       │   ├── schema.ts         # All table definitions and indexes
│       │   ├── opportunities.ts  # Queries + mutations for opportunities
│       │   ├── users.ts          # User profile queries + mutations
│       │   ├── saves.ts          # User_saves queries + mutations
│       │   ├── interests.ts      # User_interests queries + mutations
│       │   ├── feed.ts           # Personalized feed query
│       │   ├── notifications.ts  # Notifications log
│       │   ├── pushTokens.ts     # Expo push token registry
│       │   ├── sources.ts        # Sources registry queries + mutations
│       │   ├── reminders.ts      # Cron + action for daily reminders
│       │   ├── http.ts           # HTTP endpoints (Twilio webhooks)
│       │   ├── crons.ts          # Cron definitions
│       │   └── auth.config.ts    # Clerk integration config
│       ├── lib/
│       │   ├── i18n/             # French strings
│       │   └── utils/
│       ├── assets/               # App icon, splash, fonts
│       ├── app.json              # Expo config
│       ├── eas.json              # EAS Build config
│       └── package.json
├── scraper/                      # Python scraper
│   ├── src/
│   │   ├── sources/              # Per-source config files (YAML)
│   │   ├── fetchers/             # Crawl4AI, Playwright, Apify wrappers
│   │   ├── extractor.py
│   │   ├── enricher.py
│   │   ├── deduper.py
│   │   ├── convex_client.py      # Thin wrapper around the Convex Python SDK
│   │   └── pipeline.py
│   ├── scripts/
│   │   └── seed.py
│   ├── tests/
│   └── pyproject.toml
├── docs/
│   ├── project_brief.docx
│   ├── design_prompt.md
│   └── diagrams/
├── .github/workflows/
│   └── scrape.yml                # Daily scraper cron (reminders are inside Convex)
├── .env.example
├── README.md
├── package.json
├── pnpm-workspace.yaml
└── PLAN.md                       # This file
```

---

## 3. The MVP scope (lock before starting)

The MVP must do these five things end-to-end. Nothing else.

1. A user opens the app and sees a real-time feed of opportunities scraped from at least 5 sources.
2. They can filter by category and search by keyword.
3. They can tap an opportunity to read details and click through to the source.
4. They can save opportunities (requires phone-OTP signup via Clerk at that moment).
5. They get a WhatsApp message AND a push notification when a saved opportunity is 3 days from its deadline.

**Platform scope for MVP: Android only.** iOS comes in v1.1 once Android has traction.

Everything else — onboarding wizard, multi-language toggle, application tracker beyond status, discovery agent, email digest, profile editing — is **post-MVP**. Do not build it.

---

## 4. Build steps

Work through these **in order**. Each step is checkpoint-able. Do not start step N+1 until step N's "Definition of done" passes.

---

### Step 1 — Project bootstrap

**Goal:** Empty but runnable monorepo. Mobile app boots in Expo Go. Convex dev backend connected. Scraper environment installs cleanly.

**Tasks:**
1. Create the directory structure from section 2.
2. Initialize a pnpm workspace at the root with `apps/mobile` as a workspace.
3. Bootstrap Expo: `cd apps && pnpm create expo-app mobile --template tabs` then strip to a minimum. Use Expo SDK 52+ with TypeScript and Expo Router.
4. Install NativeWind v4 in `apps/mobile` and configure `tailwind.config.js` with the color palette from `docs/design_prompt.md` (primary `#0F6E56`, deadline urgency reds/ambers/greens, category badge colors).
5. Install: `convex`, `@clerk/clerk-expo`, `zustand`, `expo-secure-store`, `expo-notifications`, `expo-linking`, `expo-constants`, `@gorhom/bottom-sheet`.
6. Run `npx convex dev` from `apps/mobile` to provision a Convex dev deployment. This creates the `convex/` directory and writes deployment URLs to `.env.local`.
7. Initialize Python in `scraper/` with `uv init`. Add: `crawl4ai`, `anthropic`, `openai`, `convex`, `python-dotenv`, `pydantic`.
8. Create root `.env.example` listing every environment variable (Convex deployment URL + admin key, Clerk publishable + secret key, Anthropic key, OpenAI key, Twilio creds). No real values.
9. Add root `README.md` with project description, prereqs (pnpm, uv, Expo CLI, Convex CLI, an Android device or emulator), and dev instructions.
10. Add `.gitignore` covering `node_modules`, `.env*` (except `.env.example`), `.expo`, `dist`, `__pycache__`, `.venv`, `ios/`, `android/` (managed workflow), `apps/mobile/convex/_generated/`.
11. Configure `app.json`: app name "Opportunity Finder", slug, primary color, placeholder icon/splash.

**Definition of done:**
- `pnpm install` from root completes.
- `cd apps/mobile && pnpm start` shows Expo dev tools. Scanning the QR with Expo Go on Android loads the app with the default tab navigator.
- `npx convex dev` is running and reports "Convex functions ready!"
- The Convex dashboard at dashboard.convex.dev shows the dev deployment.
- `cd scraper && uv run python -c "import crawl4ai, convex; print('ok')"` prints "ok".
- NativeWind verified: a `<View className="bg-green-600 p-4"><Text className="text-white">Hello</Text></View>` in the home screen renders with the correct color.

---

### Step 2 — Convex schema and Clerk auth setup

**Goal:** Convex schema defined and deployed. Clerk integrated for phone OTP. Mobile app can authenticate.

**Tasks:**
1. Create a Clerk application in the Clerk dashboard. Enable **Phone number** as the primary identifier. Disable email/password. Configure Twilio as the SMS provider (Clerk lets you bring your own Twilio account — recommended to keep costs predictable).
2. In Clerk, restrict allowed countries to Togo (+228) for MVP to prevent fraud. Add Ghana, Benin, and Côte d'Ivoire later when you expand.
3. Wire Clerk into the Expo app:
   - Wrap the root layout in `<ClerkProvider publishableKey={...}>`.
   - Configure Convex to verify Clerk JWTs in `convex/auth.config.ts`.
   - Wrap the same root in `<ConvexProviderWithClerk>`.
4. Define the full schema in `apps/mobile/convex/schema.ts`. Tables matching the ERD:
   - `users` — fields: `clerkUserId`, `phone`, `fullName`, `region`, `educationLevel`, `fieldOfStudy`, `language`, `notifPrefs`, `whatsappOptOut`, `createdAt`, `lastActiveAt`. Index on `by_clerk_user_id`.
   - `sources` — `name`, `url`, `sourceType`, `country`, `scrapeFrequency`, `lastScrapedAt`, `trustScore`, `status`, `totalOpportunities`. Index on `by_status`.
   - `opportunities` — `sourceId` (Id<'sources'>), `title`, `slug`, `description`, `category`, `deadlineAt`, `geographicScope`, `fundingLevel`, `educationLevelMin`, `fieldTags` (array), `language`, `format`, `duration`, `ageMin`, `ageMax`, `sourceUrl`, `mirrorUrls` (array), `embedding` (array of float, vector-indexed at dim 1536), `verified`, `status`, `scrapedAt`, `publishedAt`. Indexes: `by_deadline_status`, `by_category_deadline`, `by_slug`. Vector index `by_embedding` with filter fields `[category, language, status]`.
   - `userInterests` — `userId`, `category`, `fieldTag`, `weight`, `createdAt`. Index on `by_user`.
   - `userSaves` — `userId`, `opportunityId`, `status` (saved/applied/won/declined), `userNotes`, `savedAt`, `appliedAt`. Indexes: `by_user_status`, `by_user_opportunity`, `by_deadline_for_reminders` (composite).
   - `notifications` — `userId`, `opportunityId`, `channel` (whatsapp/push), `triggerType` (deadline_reminder/new_match/digest), `sentAt`, `openedAt`, `clickedAt`. Index `by_user_opportunity_trigger` (used to prevent duplicate reminders).
   - `pushTokens` — `userId`, `expoPushToken`, `deviceId`, `platform`, `createdAt`. Index `by_user`.
5. Run `npx convex dev` to push the schema. Verify in the Convex dashboard that all tables exist with correct indexes including the vector index.
6. Write a minimal `users.ensureUser` mutation: takes the Clerk auth context, upserts a `users` row keyed by `clerkUserId`, returns the user. Call it from the mobile app on every app start (use Convex's `useMutation` hook in the root layout).

**Definition of done:**
- The Convex dashboard shows all 8 tables with correct indexes (including the vector index on `opportunities.embedding`).
- The mobile app shows a "Se connecter" button when not authenticated; tapping it opens Clerk's phone OTP flow; entering a +228 number and the SMS code logs the user in.
- After login, a row appears in `users` with the correct `clerkUserId` and phone.
- Force-quit and reopen the app → still logged in (Clerk session persists via `expo-secure-store`).
- The Convex auth identity check (`ctx.auth.getUserIdentity()`) returns the Clerk user on authenticated calls.

---

### Step 3 — Seed data

**Goal:** 20 real Togolese opportunities in Convex so the UI has something to render before the scraper exists.

**Tasks:**
1. Manually collect 20 real, current opportunities from ANPE Togo, emploitogo.info, afterschoolafrica (Togo tag), scholars4dev (Togo tag), Campus France, U.S. Embassy Lomé, AU Youth opportunities. At least 2 per category, realistic deadlines.
2. Write a Convex mutation `sources.seedSources` that bulk-inserts the 5 sources (idempotent — checks if URL exists first). Mark this mutation as **internal** so the mobile app cannot call it directly.
3. Write a Convex mutation `opportunities.bulkInsert` that takes an array of opportunity records and inserts them. Also internal.
4. Write `scraper/scripts/seed.py`:
   - Reads 20 hand-curated opportunities from a local JSON fixture.
   - For each opportunity, generates an embedding via OpenAI.
   - Calls `sources.seedSources` then `opportunities.bulkInsert` via the Convex Python client.
5. Spread `deadlineAt` across the next 60 days; at least 3 in the next 7 days.

**Definition of done:**
- `uv run python scraper/scripts/seed.py` inserts 20 opportunities and 5+ sources.
- The Convex dashboard's data browser shows the seeded rows.
- At least 3 opportunities have deadlines within the next 7 days.
- Every opportunity has a 1536-dim embedding array.

---

### Step 4 — Home feed screen

**Goal:** Open the app, see a working real-time home feed with real data.

**Tasks:**
1. Build the `OpportunityCard` component per `docs/design_prompt.md`:
   - Category badge (small colored pill, color by category)
   - Source name and location
   - Title (2 lines max, ellipsis)
   - Two-fact subtitle row
   - Deadline pill colored by days remaining (red <7d, amber <30d, green ≥30d)
   - Bookmark icon top-right (no-op for now)
2. Write a Convex query `opportunities.homeFeed`:
   - Two return sections: `closingThisWeek` (deadline within 7 days, ordered asc, limit 5) and `forYou` (rank by `(source.trustScore * 100) - daysUntilDeadline`, limit 20). For unauthenticated users `forYou` is the trust-and-recency ranking; the personalized version comes in step 11.
3. Home screen at `apps/mobile/app/(tabs)/index.tsx` uses Convex's `useQuery` to consume `homeFeed`. The hook gives real-time updates for free — no pull-to-refresh needed (but add one anyway as a UX backup).
4. Above the feed: greeting row ("Bonjour" + first name from Clerk, or "Bienvenue" for anonymous users), bell icon top-right.
5. Search bar (touch opens the Explore tab; no inline search yet).
6. Horizontal scrollable filter chip row: Tout, Bourses, Emplois, Fellowships, Subventions, Concours, Formations, Événements, Bénévolat. Tapping a chip updates a local state and re-runs the query with a `category` filter param.
7. Bottom tab bar matches design: Accueil, Explorer, Sauvés, Alertes, Profil. Active tab in primary green.
8. French copy, primary green, NO images. Skeleton component (not spinner) while loading.

**Definition of done:**
- Opening the app on real Android shows the home feed with 20 seeded opportunities.
- Deadline pills show correct colors based on actual days remaining.
- Tapping "Bourses" filters to category=scholarships.
- Inserting a new opportunity in the Convex dashboard (with a near deadline) makes it appear in the feed within ~1 second WITHOUT the user refreshing.
- Initial render under 2 seconds on a mid-range Android device.

---

### Step 5 — Opportunity detail screen

**Goal:** Tap a card → full detail view. Apply and Share work.

**Tasks:**
1. Create `apps/mobile/app/opportunity/[id].tsx`. Use Convex `useQuery` to fetch the full opportunity by id. The query should also fetch the source name for the verified check.
2. Layout per spec:
   - Header: back arrow (left), share icon (right)
   - Hero: category badge, title (22pt, weight 500), source name with verified check
   - Three-pill key facts: deadline, location, funding level
   - Body sections: À propos, Qui peut postuler, Ce que ça couvre, Comment postuler, Date limite (full date + timezone)
3. Sticky bottom action bar:
   - "Sauvegarder" with bookmark icon (greyed for now, wired in step 7)
   - "Postuler" — primary green, opens `sourceUrl` via `expo-linking` in device browser
4. Share button: native share sheet (Expo Sharing or `react-native-share`). Default text: `"Regarde cette opportunité: {title} — ferme dans {N} jours. Postule ici: {sourceUrl}"`. WhatsApp is the default share target on Android.
5. Deep linking config in `app.json`: scheme `opportunityfinder://`. Route handler so `opportunityfinder://opportunity/{id}` opens the detail screen.

**Definition of done:**
- Tapping any card from home opens its detail screen.
- "Postuler" opens the source URL in device browser.
- Share button triggers Android's share sheet, WhatsApp prominent.
- Deep link `opportunityfinder://opportunity/{realId}` (test via `adb shell am start ...`) opens the right screen.
- Back gesture and back arrow both work.

---

### Step 6 — Search and filter (Explore tab)

**Goal:** Explorer tab works. Users can search by keyword and combine filters.

**Tasks:**
1. Build `apps/mobile/app/(tabs)/explore.tsx`. Search bar at top, filter icon right.
2. Write a Convex query `opportunities.search` taking `(searchTerm?, category?, geographicScope?, fundingLevel?, educationLevel?, deadlineBefore?)`. Use Convex's `withSearchIndex` for full-text search on the `title` field — define a search index on `opportunities` with searchable field `title` and filter fields `[category, language, status]`.
3. Filter bottom sheet (`@gorhom/bottom-sheet`): category multi-select, geographic scope, funding level, education level, deadline range. Buttons: Réinitialiser, Appliquer.
4. Filter state in Zustand store so it survives tab switches.
5. Empty state: "Aucune opportunité trouvée. Modifie tes filtres ou explore le fil principal."
6. Recent searches in `expo-secure-store`; show below search bar when input is empty.
7. Debounce search input by 300ms before re-running the Convex query.

**Definition of done:**
- Typing "bourse" returns matches within 500ms after debounce.
- Combining "category=fellowships" + "funding=fully_funded" returns the intersection.
- Filter state persists across tab switches.
- Empty state renders correctly when no matches.

---

### Step 7 — The Save action

**Goal:** Authenticated users can save opportunities. Tapping "Sauvegarder" while signed out launches the Clerk OTP flow.

**Tasks:**
1. Write Convex mutations:
   - `saves.add(opportunityId)` — inserts a `userSaves` row with `status: 'saved'`. Throws if not authenticated.
   - `saves.remove(opportunityId)` — deletes the matching row.
   - `saves.markApplied(opportunityId)` — updates `status` to `applied`, sets `appliedAt`.
   - `saves.listMine(status?)` — returns the current user's saves with their opportunity data joined in.
2. Wire "Sauvegarder" on the detail screen:
   - If `useAuth().isSignedIn` is false → call `signIn()` from Clerk to open the OTP flow as a modal, then call `saves.add` after success.
   - If signed in → call `saves.add` directly and show a toast "Opportunité sauvegardée".
3. The bookmark icon on each `OpportunityCard` also calls `saves.add`/`saves.remove` (logged-in only — for anonymous users it bounces to sign-in).
4. Build the Saved tab at `apps/mobile/app/(tabs)/saved.tsx`. Two top tabs: Marqués (`status='saved'`) and Postulés (`status='applied'`). Each shows the `OpportunityCard` with a remove "x" or status pill. Both lists use `useQuery(saves.listMine, { status: ... })` and update in real time.
5. On the detail screen, add a "Marquer comme postulé" button that appears after the user has tapped "Postuler" (track this client-side per session). Calls `saves.markApplied`.

**Definition of done:**
- A new user signs up with +228 number via Clerk OTP in under 30 seconds.
- "Sauvegarder" works and persists across app restarts.
- Saved tab shows only the user's saves (Convex auth enforces this via `ctx.auth.getUserIdentity()` checks inside the query).
- Tapping the bookmark icon on a card toggles its save state and updates the Saved tab in real time.
- Trying to call `saves.add` without auth returns an error.

---

### Step 8 — Push notification setup

**Goal:** App registers for Expo push notifications and stores the token in Convex.

**Tasks:**
1. Configure Expo push in `app.json` with Android permissions.
2. Write a Convex mutation `pushTokens.register(expoPushToken, deviceId, platform)` — upserts by `(userId, deviceId)`.
3. On app start (and after sign-in), call `Notifications.getExpoPushTokenAsync()` and pass the token to `pushTokens.register` via `useMutation`.
4. Permission prompt appears after the user's first save (not on first launch — too early): "Active les notifications pour recevoir des rappels avant les dates limites."
5. Test send from Expo's push tool (web UI) → verify lands on device.

**Definition of done:**
- Granting permission inserts a row in `pushTokens`.
- Sending a push via Expo's web tool delivers a notification with correct title/body.
- Tapping the notification opens the app (deep link to detail screen comes in step 11).

---

### Step 9 — The scraper, end to end for one source

**Goal:** Python script scrapes anpetogo.org, extracts via Claude Haiku, writes to Convex.

**Tasks:**
1. Create `scraper/src/sources/anpetogo.yaml`: name, base URL, type ("static"), listing page URL pattern, scrape frequency.
2. Build `scraper/src/fetchers/static.py` using Crawl4AI. Returns clean markdown.
3. Build `scraper/src/extractor.py`:
   - Takes markdown.
   - Calls Claude Haiku with a prompt returning a JSON array matching our schema.
   - Validates with Pydantic.
   - Returns list of `Opportunity` dataclasses.
4. Build `scraper/src/enricher.py`:
   - Classify into one of 8 categories.
   - Generate embedding via OpenAI.
   - Add field tags.
5. Build `scraper/src/deduper.py`:
   - For each new candidate, call a Convex query `opportunities.findSimilar({ embedding, category, threshold: 0.92 })` that uses Convex's vector search with a filter on `category` (and `status='published'`). Returns up to 3 closest matches with similarity scores.
   - If any match exceeds 0.92 cosine similarity → call mutation `opportunities.addMirrorUrl(existingId, newUrl)`.
   - Otherwise → call mutation `opportunities.insert(opportunity)`.
6. Build `scraper/src/convex_client.py`: a thin wrapper around the `convex` Python SDK that holds the deployment URL + admin key from env vars, and exposes typed helper methods for the mutations and queries the scraper needs.
7. Build `scraper/src/pipeline.py` orchestrating fetch → extract → enrich → dedupe for a source name passed as CLI arg.
8. Structured logging for every step.

**Definition of done:**
- `uv run python -m scraper.pipeline --source anpetogo` runs end-to-end cleanly.
- Real ANPE opportunities appear in Convex with correct `sourceId`.
- Re-running doesn't create duplicates — second run's logs show "merged X, inserted 0".
- The Convex dashboard's logs show the mutations being called.

---

### Step 10 — Scale the scraper to 5 sources

**Goal:** Scraper pulls from 5 sources daily via a scheduled job.

**Tasks:**
1. Add YAML configs for emploitogo.info, afterschoolafrica (Togo tag), scholars4dev (Togo tag), Campus France Togo.
2. Update `pipeline.py` to accept `--all` flag that iterates all enabled sources.
3. Update `lastScrapedAt` on each `sources` row after each run via mutation `sources.markScraped(sourceId, opportunitiesProcessed)`.
4. GitHub Actions workflow `.github/workflows/scrape.yml` daily at 06:00 UTC. Secrets: `CONVEX_URL`, `CONVEX_ADMIN_KEY`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`.
5. Convex query `sources.adminStatus` returning source statuses (last scraped, count of opportunities, status). Hidden admin screen in the mobile app (gated by hardcoded admin phone numbers in env) calls it and renders data with `useQuery` (real-time updating).

**Definition of done:**
- `uv run python -m scraper.pipeline --all` runs all 5 sources cleanly.
- GitHub Actions workflow succeeds on manual trigger.
- After one cron run: at least 50 unique opportunities in Convex.
- Admin screen shows accurate stats and live-updates as scrapes finish.

---

### Step 11 — Personalization, deadline reminders, deep linking

**Goal:** Logged-in users see a personalized feed and receive WhatsApp + push reminders 3 days before saved deadlines. Both pieces run inside Convex.

**Tasks:**

1. **Personalization:**
   - One-screen interest picker after the first save (8 category cards, pick at least 1). Calls `interests.set(categories, fieldTags)`.
   - Update the `opportunities.homeFeed` query for authed users:
     - Compute a relevance score: `0.4 * source.trustScore + 0.6 * interestMatchScore`.
     - `interestMatchScore = 1.0` if the opportunity's category is in the user's interests; otherwise compute cosine similarity between the opportunity embedding and the **centroid** of the user's saved opportunities' embeddings (compute the centroid in a separate query that caches the result on the user document).
     - Order by `relevance / max(daysUntilDeadline, 1)` desc.

2. **Reminders (combined WhatsApp + push, inside Convex):**
   - Set up Twilio WhatsApp sandbox. Document the join code in README.
   - Write a Convex internal action `reminders.sendDeadlineReminders`:
     - Queries `userSaves` where `deadlineAt` is in [now+2d, now+3d] AND `status='saved'` AND no reminder already sent (check `notifications` via index `by_user_opportunity_trigger`).
     - For each match: send WhatsApp via Twilio's HTTP API AND send push via Expo Push API (using token from `pushTokens`).
     - Insert one `notifications` row per channel.
   - WhatsApp message format:
     ```
     *Rappel — {title}*

     ⏰ Cette opportunité ferme dans {N} jours.

     📋 {category} · {source_name}

     👉 Postuler : {source_url}
     ```
   - Push format: title="⏰ {title}", body="Ferme dans {N} jours · Tape pour postuler", data={ opportunityId }.
   - Register a Convex cron in `convex/crons.ts` that calls `reminders.sendDeadlineReminders` daily at 08:00 UTC. No GitHub Actions needed for this — Convex runs the cron natively.
   - Build a Convex HTTP endpoint in `convex/http.ts` for Twilio's inbound webhook to handle STOP keyword. On "STOP" → mutation that sets `whatsappOptOut=true` on the user.

3. **Deep linking polish:**
   - Tapping a push notification opens the relevant opportunity detail using `data.opportunityId`.
   - WhatsApp links use Universal Links / Android App Links so clicking inside WhatsApp opens the app (web fallback for later).

**Definition of done:**
- A new user picking "Tech" + "Bourses" sees primarily tech scholarships on Home, noticeably reordered from anon view.
- Manually triggering the action via the Convex dashboard: a test user with a saved opportunity due in 3 days receives BOTH a WhatsApp message AND a push notification.
- Tapping the push opens the correct detail screen.
- The Convex cron is visible in the dashboard's "Schedules" tab and scheduled correctly.
- Re-triggering doesn't send duplicates (the `notifications` table check works).
- Replying "STOP" on WhatsApp sets `whatsappOptOut=true` (push still works).

---

### Step 12 — Polish, build, ship to Google Play internal track

**Goal:** App installable from a Google Play internal track link, ready for first beta users.

**Tasks:**
1. Configure EAS Build (`eas.json`) with two profiles: `preview` (internal APK) and `production` (AAB for Play Store).
2. Generate final app icon (1024×1024) and splash screen per Expo specs. Primary green + simple wordmark — don't over-design.
3. Sentry:
   - `@sentry/react-native` in `apps/mobile`
   - `sentry-sdk` in scraper
   - Convex has built-in error logging visible in its dashboard — review it after each deploy.
4. PostHog with `posthog-react-native`. Track: `app_opened`, `opportunity_viewed`, `opportunity_saved`, `apply_clicked`, `signup_completed`, `share_clicked`, `push_received`, `push_opened`.
5. In-app "À propos" / "Conditions" / "Confidentialité" screens. Boilerplate French copy is fine for MVP — consult a lawyer before any paid features.
6. Promote Convex from dev deployment to **prod deployment**: `npx convex deploy`. Update the mobile app's env to point to the prod Convex URL for the production build. Update GitHub Actions secrets to point to the prod Convex URL + admin key.
7. `eas build --profile production --platform android` → produce `.aab`.
8. Google Play Console listing:
   - App name, short and full descriptions (French)
   - 4+ screenshots from a real device
   - Privacy policy URL (host on GitHub Pages for now)
   - Feature graphic and icon
   - Submit to internal testing track
9. Add 5–10 internal testers via Play Console (their Google emails).
10. `eas update` configured for OTA: non-native fixes can ship instantly without a new build.
11. Final QA pass on a real +228 number: full flow install → browse → save → reminder → apply.

**Definition of done:**
- Internal tester receives Play Store invite, taps link, installs app.
- Full flow works on fresh install: open → browse → save → sign up with real +228 → receive WhatsApp + push reminder 3 days later → apply.
- Sentry catches a deliberately thrown test error in both apps.
- The Convex dashboard's logs show no unexpected errors during a 24h period.
- PostHog dashboard shows real events from at least 3 test devices.
- App launch under 3 seconds on a mid-range Android (Tecno, Infinix, Itel — common Togo brands).
- App size under 30 MB.
- 10 manual test sessions without critical bugs.

---

## 5. Conventions for Claude Code while working on this project

- **Always run typecheck and lint before declaring a step done.** `pnpm typecheck && pnpm lint` in `apps/mobile`; `uv run mypy src/` in `scraper/`. Convex generates types automatically — `npx convex dev` must be running for the generated types to stay in sync.
- **All sensitive logic lives inside Convex functions, not in the client.** The mobile app should never compute who is allowed to do what — let Convex enforce it via `ctx.auth.getUserIdentity()` checks inside queries and mutations.
- **Use `internal` Convex functions for anything the client should not call.** Seed scripts, scraper inserts, reminder dispatch — all must be internal (callable only from other Convex functions or with the admin key, never from a client).
- **Use Convex `useQuery` for all server state.** Do not use TanStack Query — it's redundant with Convex hooks. Do not use `useEffect`+`fetch` patterns.
- **Never commit secrets.** Use `.env.local` (gitignored). Update `.env.example` whenever adding a var. Expo public env vars must be prefixed `EXPO_PUBLIC_`. The Convex admin key is a server-only secret — never expose to the mobile app.
- **Never use `any` in TypeScript.** Convex generates types for every table and function — import them from `convex/_generated/api` and `convex/_generated/dataModel`.
- **All user-facing strings in French.** Use `apps/mobile/lib/i18n/fr.ts` from day one. Do not hardcode strings in components. English translation post-MVP but structure ready.
- **Use NativeWind classes for styling.** Inline `StyleSheet.create()` only when NativeWind cannot express the style.
- **Prefer Expo's managed APIs over native modules.** No libraries requiring `expo prebuild` unless absolutely necessary. Keeping managed workflow means OTA updates keep working.
- **Test on a real Android device early and often.** Emulator lies about performance. Target user is on Tecno/Infinix, not Pixel.
- **If a step needs an external account** (Google Play, Twilio, Clerk billing), pause and ask the user.
- **If you're about to make a stack decision not covered in section 1, stop and ask.** Do not silently install a new library.

---

## 6. What is explicitly out of scope for MVP

Do not build any of these until the MVP is in real users' hands and the data tells you they're needed:

- iOS build and TestFlight (Android-only for MVP)
- Email digest
- SMS notifications (push + WhatsApp is enough)
- Multi-language toggle (English UI)
- Application tracker beyond saved/applied status
- Profile editing UI beyond initial signup
- Discovery agent (proposing new sources)
- Admin moderation tools beyond the simple status screen
- Comments, ratings, social features
- Mentor matching, alumni networks, application help
- Multi-country expansion (Clerk is restricted to +228 only for now)
- AI chat assistant
- Offline mode (network required for MVP)
- Payment, subscriptions, anything monetized

Anything in this list, even if it seems easy, **adds risk and delays launch**. Resist.

---

## 7. Done means done

The MVP is complete when:

1. A real Togolese user installs the app from a Google Play internal track link.
2. Opens the app and browses opportunities without signing up.
3. Signs up with their +228 phone number via Clerk OTP in under 30 seconds when they tap Save.
4. Saves at least one opportunity.
5. Receives both a WhatsApp message and a push notification 3 days before its deadline.
6. Taps the push notification, opens the detail screen, taps Postuler, and lands on the source page.

If any of those six steps is broken, the MVP is not done — regardless of how many features are built.
