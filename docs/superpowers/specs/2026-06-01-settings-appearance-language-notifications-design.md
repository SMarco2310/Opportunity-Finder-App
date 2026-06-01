# Settings: Appearance, Language & Notifications — Design

**Date:** 2026-06-01
**Status:** Approved (architecture), pending implementation plan
**Area:** `apps/mobile` — Profile → Settings rows

## Problem

The Profile screen's settings rows (Notifications, Langue, Apparence) are
display-only (`apps/mobile/app/(tabs)/profile.tsx`). Tapping them does nothing.
Make all three functional: toggle notifications, switch app language (FR/EN),
and switch appearance (light/dark/system).

## Scope decisions (locked)

| Area | Decision |
|------|----------|
| Appearance | **Mechanism + phased restyle.** Build the dark-mode mechanism + selector now; mop up hardcoded hex in a tracked follow-up. |
| Language | **Reactive i18n + full EN.** Real switching, complete English dictionary. |
| Persistence | **In-memory zustand.** Settings reset on app restart; wire to AsyncStorage/Convex when auth lands. Matches current mock-backed approach. |
| Notifications | **Preference toggle only.** No OS permission prompt yet. |

## Architecture

### A. Shared settings store — `lib/store/settings.ts`

Zustand store (no persist middleware), mirroring the existing `lib/store/filters.ts` pattern.

```ts
export type Locale = 'fr' | 'en';
export type ThemePref = 'light' | 'dark' | 'system';

type SettingsState = {
  locale: Locale;                  // default 'fr'
  theme: ThemePref;                // default 'dark' (matches current mock value "Sombre")
  notificationsEnabled: boolean;   // default true (matches "Activées")
  setLocale: (l: Locale) => void;
  setTheme: (t: ThemePref) => void;
  setNotificationsEnabled: (v: boolean) => void;
};
```

**Theme default:** `theme: 'system'` (follows device). The app is not yet fully
dark-styled, so `system`/`light` avoids a half-done look until the phase-2 restyle.
`notificationsEnabled: true`, `locale: 'fr'`.

### B. Reactive i18n

Current state: a single `lib/i18n/fr.ts` (187 lines) imported as `{ fr }` in 18 files.

- **`lib/i18n/en.ts`** — full English mirror of `fr.ts`, identical shape.
- **`lib/i18n/index.ts`**:
  ```ts
  import { fr } from './fr';
  import { en } from './en';
  import { useSettings } from '@/lib/store/settings';

  export type Dict = typeof fr;
  const dict: Record<Locale, Dict> = { fr, en };
  export const getDict = (l: Locale): Dict => dict[l];
  export function useT(): Dict {
    return dict[useSettings((s) => s.locale)];
  }
  ```
- **Refactor 18 files** that import `{ fr }`:
  - `import { fr } from '@/lib/i18n/fr'` → `import { useT } from '@/lib/i18n'`
  - add `const t = useT();` at the top of the component
  - replace `fr.` → `t.`
  - Every current `fr.` usage is inside a component body, so the hook is valid.
    During implementation, verify no module-scope `fr.` usage; if any exists,
    convert it to `getDict()` at call site or pass `t` in.

Files importing `i18n/fr` (verified):
`app/(tabs)/index.tsx`, `app/(tabs)/explore.tsx`, `app/(tabs)/profile.tsx`,
`app/(tabs)/saved.tsx`, `app/(tabs)/_layout.tsx`, `app/opportunity/[id].tsx`,
`app/onboarding/{index,profile,interests,done,account}.tsx`,
`components/explore/FilterSheet.tsx`, `components/home/{GreetingHeader,SearchBar,FilterChips}.tsx`,
`components/cards/ApplicationCard.tsx`, `components/profile/InterestChips.tsx`,
`components/saved/ClosingThisWeekSheet.tsx`.

### C. Theme mechanism

NativeWind v4 is wired (`global.css` via `metro.config.js`, imported in `app/_layout.tsx`).

1. **`global.css`** — define the palette as CSS-variable RGB channels under
   `:root` (light) and `.dark` (dark), e.g.:
   ```css
   @layer base {
     :root {
       --color-paper: 246 241 233;
       --color-paper-card: 255 255 255;
       --color-ink: 27 23 20;
       /* …all palette tokens… */
     }
     .dark {
       --color-paper: 23 21 18;
       --color-paper-card: 33 30 26;
       --color-ink: 240 236 230;
       /* …dark values… */
     }
   }
   ```
2. **`tailwind.config.js`** — set `darkMode: 'class'`; convert color tokens to
   reference the channels so alpha modifiers keep working:
   ```js
   paper: {
     DEFAULT: 'rgb(var(--color-paper) / <alpha-value>)',
     card: 'rgb(var(--color-paper-card) / <alpha-value>)',
     sunk: 'rgb(var(--color-paper-sunk) / <alpha-value>)',
   },
   // …same pattern for ink, line, primary, accent, urgency, glow, cat.*
   ```
   Existing usages like `bg-glow/30`, `bg-ink/…`, `active:opacity-90` keep working.
3. **`ThemeSync`** (small component or inline effect) mounted in `app/_layout.tsx`:
   ```ts
   import { colorScheme } from 'nativewind';
   const theme = useSettings((s) => s.theme);
   useEffect(() => colorScheme.set(theme), [theme]); // 'system' follows device
   ```

**Effect now:** every class-based surface (`bg-paper`, `text-ink`, `border-line`,
`bg-paper-card`, `bg-paper-sunk`) flips automatically — the bulk of the UI.

**Phase-2 follow-up (tracked, NOT in this work):** hardcoded hex that bypasses
the token system won't flip until restyled:
- Icon `color=` props (`#1B1714`, `#8B8175`, `#B6ADA0`, …) across components.
- `LinearGradient` rgba in `FeaturedCard.tsx` / closing banner glow.
- `DeadlineNumeral` urgency colors, `CategoryBadge` pastels.
- `StatusBar style="dark"` and `Stack` `contentStyle.backgroundColor: '#F6F1E9'` in `_layout.tsx`.
- Bottom-sheet `backgroundStyle`/`handleIndicatorStyle` hardcoded hex.

### D. Generic selector sheet — `components/profile/SettingSelectSheet.tsx`

`forwardRef<BottomSheetModal>`, same pattern as `components/explore/FilterSheet.tsx`.

```ts
type Option<T extends string> = { value: T; label: string };
props: { title: string; options: Option<T>[]; selected: T; onSelect: (v: T) => void };
```

Renders a radio list (label + check on the selected row). Selecting calls
`onSelect` then dismisses. Backdrop + handle styling matches `FilterSheet`.

Used for **Langue** and **Apparence** only. `profile.tsx` holds two sheet refs;
each row's `onPress` presents its sheet; each row's `value` text derives from
`useT()` + store.

**Notifications uses an inline `Switch`** (not a sheet). Extend `SettingsRow`
with an optional `toggle?: { value: boolean; onChange: (v: boolean) => void }`.
When present, `SettingsList` renders a React Native `Switch` on the right instead
of the value text + chevron, and the row is not pressable for navigation.

### E. New i18n keys (both `fr.ts` and `en.ts`)

Under `profile`:
- `english` (FR: "Anglais", EN: "English"); `french` exists.
- notifications: existing `on` ("Activées") + add `off` ("Désactivées") for the row value text.
- theme labels: `themeLight` ("Clair"/"Light"), `themeDark` ("Sombre"/"Dark"), `themeSystem` ("Système"/"System").
- sheet titles: reuse existing `language` / `appearance` labels as the sheet titles.

## Components & boundaries

| Unit | Purpose | Depends on |
|------|---------|-----------|
| `lib/store/settings.ts` | Single source of truth for locale/theme/notifications | zustand |
| `lib/i18n/index.ts` | `useT()` / `getDict()` locale resolution | settings store, fr/en dicts |
| `lib/i18n/en.ts` | English dictionary | — |
| `ThemeSync` (in `_layout.tsx`) | Push `theme` → NativeWind `colorScheme` | settings store, nativewind |
| `SettingSelectSheet` | Reusable radio bottom sheet | @gorhom/bottom-sheet |
| `profile.tsx` | Wire 3 rows to sheets + live values | all of the above |
| `global.css` + `tailwind.config.js` | CSS-var palette + dark block | — |

## Testing / verification

- Typecheck: `npx tsc --noEmit` clean for app/components/lib (pre-existing Convex
  `_generated` errors are unrelated).
- Manual (run app): Profile → tap each row → sheet opens → select option →
  row value updates; Langue switch flips visible text app-wide; Apparence
  Sombre flips class-based surfaces.

## Resolved decisions

1. **Default theme** = `system`.
2. **Notifications UI** = inline `Switch` (no sheet).

## Out of scope

- Persisting settings across restarts (AsyncStorage/Convex) — later.
- Real OS notification permission via `expo-notifications` — later.
- Phase-2 dark restyle of hardcoded-hex components — separate tracked work.
- Additional locales beyond FR/EN.
