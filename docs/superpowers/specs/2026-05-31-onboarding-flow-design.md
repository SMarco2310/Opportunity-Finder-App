# Onboarding Flow — Design

Date: 2026-05-31
Status: Approved (pending spec review)

## Goal

Replace the single `onboarding/interests.tsx` screen with a full first-launch
onboarding flow: splash → intro → create account → name+age → interests → done →
app. Persist profile (name, age, interests) and an onboarding-complete flag to
Convex, and gate the app so onboarding shows only until completed.

## Decisions (locked)

- **Color:** olive/cream theme everywhere. Mocks (images 8–13) are layout
  reference only; recolor orange → existing `accent` (#6E8B3D) / `primary`
  (#0F6E56) / `paper` / `ink` tokens.
- **Auth:** wire real Clerk Google + Apple OAuth and email-code this pass.
- **Scope:** all 6 screens + Convex persistence + first-launch gating.
- **Intro:** animated brand splash (~1.5s, auto-advance) → one value/intro screen
  (image 9). No multi-slide carousel.
- **"J'ai déjà un compte":** routes to the same `account.tsx`; Clerk signs in
  returning users via the same OAuth/email controls.

## Navigation map

New stack under `app/onboarding/`:

| Route                    | Screen            | Mock | Progress |
| ------------------------ | ----------------- | ---- | -------- |
| `onboarding/index.tsx`   | Splash + intro    | 8, 9 | —        |
| `onboarding/account.tsx` | Create / sign-in  | 10   | 1/3      |
| `onboarding/profile.tsx` | Name + age        | 11   | 2/3      |
| `onboarding/interests.tsx` | Interests (restyle existing) | 12 | 3/3 |
| `onboarding/done.tsx`    | All set           | 13   | —        |
| `onboarding/_layout.tsx` | Stack wrapper     | —    | —        |

- `index.tsx`: brand splash (centered target logo + wordmark) auto-animates for
  ~1.5s, then crossfades to the intro/value screen (stacked opportunity cards
  hero, headline with italic-accent word, `Commencer` primary button,
  `J'ai déjà un compte` text link). Both `Commencer` and `J'ai déjà un compte`
  navigate to `account.tsx`.
- Back chevron + segmented progress bar on `account`/`profile`/`interests`
  (3 segments). `done` has neither.

## Gating

Approach A — gate at the app root.

- New `app/index.tsx` is the initial route (replaces `initialRouteName: '(tabs)'`).
- It resolves three signals and renders `<Redirect>`:
  - `introSeen` — local boolean in SecureStore (key `of:introSeen`).
  - `isSignedIn` — Clerk `useAuth()`.
  - `onboardingCompletedAt` — Convex `users.me`.
- Decision (pure function `decideRoute(signals)` in `lib/onboarding/route.ts`,
  unit-tested):
  - `!introSeen` → `/onboarding` (intro)
  - `introSeen && !isSignedIn` → `/onboarding/account`
  - `isSignedIn && !onboardingCompletedAt` → `/onboarding/profile` (resume)
  - else → `/(tabs)`
- While Clerk/Convex are still loading, render the splash (no flash of tabs).
- `introSeen` is set when the user leaves the intro (taps `Commencer` /
  `J'ai déjà un compte`).
- **Mock mode** (`authConfigured === false`, no Clerk/Convex keys): skip the
  auth-dependent branches. Intro → account → profile → interests → done are
  fully navigable for UI preview; `done` does `router.replace('/(tabs)')`.
  `decideRoute` treats `isSignedIn` as false and simply lets the user walk the
  flow; nothing persists.

## Convex changes

`convex/schema.ts` — extend `users`:

```ts
age: v.optional(v.number()),
onboardingCompletedAt: v.optional(v.number()),
```

(`phone` stays `v.string()`; `ensureUser` already defaults it to `''`, which
covers OAuth identities with no phone.)

New `convex/profile.ts`:

- `completeOnboarding` mutation, args `{ fullName: string, age?: number,
  categories: Category[] }`:
  1. ensure the user row exists (same upsert as `ensureUser`),
  2. patch `fullName`, `age`, `onboardingCompletedAt = Date.now()`,
  3. replace `userInterests` (clear-then-insert, reusing the logic in
     `interests.set`).
  Runs atomically in one mutation so a completed onboarding is all-or-nothing.

`users.me` already returns the row including the two new fields → the gate reads
them directly.

## Auth wiring (Clerk)

`account.tsx`:

- **OAuth:** `useSSO().startSSOFlow({ strategy: 'oauth_google' | 'oauth_apple',
  redirectUrl })`, with `redirectUrl = Linking.createURL('/')` (expo-linking,
  already a dep). Warm up the browser with `expo-web-browser`
  (`WebBrowser.warmUpAsync` / `coolDownAsync`) and call
  `WebBrowser.maybeCompleteAuthSession()` at module load. On success
  `setActive({ session })`, then the root gate routes onward.
- **Email:** reuse the `useSignUp` / `useSignIn` email-code pattern (mirrors the
  existing phone flow in `(auth)/sign-in.tsx`): submit email → `email_code`
  verification → 6-digit code sub-step (local `phase` state on the screen) →
  `setActive`.
- Disabled/`authConfigured === false`: show the buttons but no-op with an inline
  "auth non configurée" note (same guard style as `sign-in.tsx`), so preview
  still renders.

**Prerequisite (manual, Clerk dashboard):** enable Google OAuth, Apple OAuth,
and Email-code sign-in; add the Apple/Google redirect to allowed origins. Listed
as a setup step in the plan, not a code task.

## Components & styling

- Recolor every mock to olive/cream tokens. Headlines use Fraunces serif with
  one italic `accent` word (e.g. *compte*, *présentations*, *t'intéresse*),
  matching the existing interests screen.
- Extract shared pieces to keep screens small (single-purpose files):
  - `components/onboarding/OnboardingProgress.tsx` — back chevron + 3-segment
    bar (`step`/`total` props).
  - `components/onboarding/OnboardingHeader.tsx` — locate icon + serif title
    (with italic accent slice) + subtitle.
  - `components/onboarding/AuthButton.tsx` — white pill button w/ leading icon
    (Google / Apple) used on `account.tsx`.
  - Reuse existing `CategoryCard` for interests.
- New `done.tsx`: centered check badge in a soft ring, serif "Tout est prêt,
  {firstName}.", subtitle with match count, primary `Découvrir mes opportunités`.
  Match count: use the real "closing this week" / matched count if cheaply
  available from an existing query; otherwise a static copy line (no new query
  built just for this).

## i18n

Extend `fr.onboarding` (in `lib/i18n/fr.ts`) with intro, account, profile, and
done strings (headlines, subtitles, button labels, field labels, legal line).
Keep existing `step`/`continue`/`skip` keys.

## Files touched

New:
- `app/index.tsx` (gate)
- `app/onboarding/_layout.tsx`, `index.tsx`, `account.tsx`, `profile.tsx`,
  `done.tsx`
- `convex/profile.ts`
- `components/onboarding/OnboardingProgress.tsx`, `OnboardingHeader.tsx`,
  `AuthButton.tsx`
- `lib/onboarding/route.ts` (+ test)

Changed:
- `app/_layout.tsx` (drop `initialRouteName: '(tabs)'`; register onboarding +
  `index` routes)
- `app/onboarding/interests.tsx` (move under stack, restyle, wire
  `completeOnboarding` instead of bare `router.replace`)
- `convex/schema.ts` (two `users` fields)
- `lib/i18n/fr.ts` (strings)

## Testing

- Unit: `decideRoute(signals)` covers all four branches + loading.
- Manual (Expo): full flow first launch → tabs; kill mid-flow → resume at
  `profile`; relaunch after completion → straight to tabs; mock-mode preview
  walks all screens.

## Out of scope (YAGNI)

- Multi-slide intro carousel.
- Editing profile/interests post-onboarding (already exists in profile tab).
- WhatsApp/notification opt-in screen (not in mocks).
- Phone-OTP removal — `(auth)/sign-in.tsx` stays for now; not wired into the new
  flow.
