# Functional Settings (Appearance / Language / Notifications) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Profile → Settings rows (Notifications, Langue, Apparence) functional: inline notifications toggle, FR/EN language switching, and light/dark/system appearance.

**Architecture:** A single in-memory zustand store (`useSettings`) holds locale/theme/notifications. i18n becomes reactive via a `useT()` hook returning the active dictionary; an English dictionary is added and 18 files migrate from `{ fr }` to `useT()`. Dark mode uses NativeWind v4 `darkMode: 'class'` with the palette converted to CSS-variable RGB channels (light `:root` + `.dark`), so class-based surfaces flip automatically; a `ThemeSync` effect pushes the chosen theme into NativeWind's `colorScheme`.

**Tech Stack:** Expo (v56) + expo-router, NativeWind v4, zustand v5, @gorhom/bottom-sheet, TypeScript.

**Testing note:** This repo has **no test runner** (no jest/vitest) and no existing tests; the feature is UI/theming-heavy. Verification per task = `npm run typecheck` (ignore pre-existing `convex/_generated` errors) + `npm run lint`, with a final manual run. Commit after each task.

**Reference spec:** `docs/superpowers/specs/2026-06-01-settings-appearance-language-notifications-design.md`

---

## File Structure

| File | Create/Modify | Responsibility |
|------|---------------|----------------|
| `apps/mobile/lib/store/settings.ts` | Create | locale/theme/notifications state |
| `apps/mobile/lib/i18n/index.ts` | Create | `useT()` / `getDict()` locale resolution |
| `apps/mobile/lib/i18n/en.ts` | Create | English dictionary (mirror of fr) |
| `apps/mobile/lib/i18n/fr.ts` | Modify | add new settings keys |
| `apps/mobile/components/profile/SettingSelectSheet.tsx` | Create | reusable radio bottom sheet |
| `apps/mobile/components/profile/SettingsList.tsx` | Modify | optional inline `Switch` support |
| `apps/mobile/app/_layout.tsx` | Modify | mount `ThemeSync` |
| `apps/mobile/app/(tabs)/profile.tsx` | Modify | wire rows → store + sheets + switch |
| `apps/mobile/tailwind.config.js` | Modify | `darkMode: 'class'` + CSS-var color tokens |
| `apps/mobile/global.css` | Modify | light/dark palette CSS variables |
| 18 files importing `i18n/fr` | Modify | `fr.` → `useT()` |

All paths below are relative to repo root. `cd apps/mobile` for npm commands.

---

## Task 1: Settings store

**Files:**
- Create: `apps/mobile/lib/store/settings.ts`

- [ ] **Step 1: Create the store**

```ts
import { create } from 'zustand';

// App-wide UI preferences. In-memory (mirrors lib/store/filters.ts); persisted
// to AsyncStorage/Convex once auth lands. Drives i18n locale (lib/i18n/index.ts)
// and dark mode (ThemeSync in app/_layout.tsx).
export type Locale = 'fr' | 'en';
export type ThemePref = 'light' | 'dark' | 'system';

type SettingsState = {
  locale: Locale;
  theme: ThemePref;
  notificationsEnabled: boolean;
  setLocale: (locale: Locale) => void;
  setTheme: (theme: ThemePref) => void;
  setNotificationsEnabled: (notificationsEnabled: boolean) => void;
};

export const useSettings = create<SettingsState>((set) => ({
  locale: 'fr',
  theme: 'system',
  notificationsEnabled: true,
  setLocale: (locale) => set({ locale }),
  setTheme: (theme) => set({ theme }),
  setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
}));
```

- [ ] **Step 2: Typecheck**

Run: `cd apps/mobile && npm run typecheck 2>&1 | grep -v '^convex/' | grep settings`
Expected: no output (no errors in the new file).

- [ ] **Step 3: Commit**

```bash
git add apps/mobile/lib/store/settings.ts
git commit -m "feat(settings): add in-memory settings store"
```

---

## Task 2: New i18n keys + English dictionary + reactive index

**Files:**
- Modify: `apps/mobile/lib/i18n/fr.ts` (the `profile` block)
- Create: `apps/mobile/lib/i18n/en.ts`
- Create: `apps/mobile/lib/i18n/index.ts`

- [ ] **Step 1: Add new keys to the `profile` block in `fr.ts`**

The `profile` object already has `notifications`, `language`, `appearance`,
`french`, `dark`, `on`. Add these keys to it (keep existing ones):

```ts
    // settings row values + selector option labels
    off: 'Désactivées',
    english: 'Anglais',
    themeLight: 'Clair',
    themeDark: 'Sombre',
    themeSystem: 'Système',
```

(If `on`/`dark`/`french` are absent, also add `on: 'Activées'`, `french: 'Français'`.)

- [ ] **Step 2: Create `en.ts` as a full mirror of `fr.ts`**

Copy `lib/i18n/fr.ts` to `lib/i18n/en.ts`, rename the export `fr` → `en`, and
translate **every** string value to English while keeping the exact same keys,
nesting, and function signatures. The object must be assignable to `typeof fr`.

Representative translations (apply the same approach to all keys):

```ts
export const en = {
  common: { /* … */ },
  tabs: { home: 'Home', explore: 'Explore', saved: 'Saved', alerts: 'Alerts', profile: 'Profile' },
  home: {
    closingThisWeek: 'Closing this week',
    forYou: 'For you',
    searchPlaceholder: 'Search for an opportunity…',
  },
  categories: {
    all: 'All', scholarships: 'Scholarships', jobs: 'Jobs', fellowships: 'Fellowships',
    grants: 'Grants', contests: 'Contests', training: 'Training', events: 'Events', volunteer: 'Volunteering',
  },
  deadline: {
    daysLeft: (n: number) => (n <= 0 ? 'Last day' : `${n} days left`),
    closesIn: (n: number) => `Closes in ${n} days`,
    fullDate: 'Deadline',
  },
  saved: {
    title: 'Saved',
    tabActive: 'Active', tabDraft: 'Drafts', tabExpired: 'Expired',
    count: (n: number) => `${n} opportunities`,
    closingSoon: (n: number) => `${n} closing soon`,
    closingThisWeek: (n: number) => `${n} closing this week`,
    closingSheetTitle: 'Closing this week',
    closingSheetSubtitle: 'You’re halfway there. Finish them before they disappear.',
    later: 'Later',
    percentDone: (n: number) => `${n}% complete`,
    resume: 'Resume',
    emptyActive: 'No active applications.',
    emptyDraft: 'No drafts.',
    emptyExpired: 'No expired opportunities.',
    toastSaved: 'Opportunity saved',
    toastRemoved: 'Removed from saved',
    /* …translate any remaining saved keys… */
  },
  profile: {
    /* …translate all existing profile keys… */
    notifications: 'Notifications', language: 'Language', appearance: 'Appearance',
    on: 'Enabled', off: 'Disabled',
    french: 'French', english: 'English',
    dark: 'Dark', themeLight: 'Light', themeDark: 'Dark', themeSystem: 'System',
  },
  /* …all other top-level blocks (detail, explore, onboarding, alerts, etc.)… */
} as const;
```

Then add this type guard line at the bottom of `en.ts` to enforce shape parity at compile time:

```ts
import type { fr } from './fr';
// Compile-time check: en must match the fr dictionary shape exactly.
const _shapeCheck: typeof fr = en;
void _shapeCheck;
```

- [ ] **Step 3: Create `lib/i18n/index.ts`**

```ts
import { useSettings, type Locale } from '@/lib/store/settings';

import { en } from './en';
import { fr } from './fr';

export type Dict = typeof fr;

const dictionaries: Record<Locale, Dict> = { fr, en };

// Non-reactive lookup for module-scope / non-component callers.
export const getDict = (locale: Locale): Dict => dictionaries[locale];

// Reactive dictionary: re-renders consumers when the locale changes.
export function useT(): Dict {
  return dictionaries[useSettings((s) => s.locale)];
}
```

- [ ] **Step 4: Typecheck (catches any en/fr shape mismatch)**

Run: `cd apps/mobile && npm run typecheck 2>&1 | grep -vE '^convex/'`
Expected: no `lib/i18n` errors. If the `_shapeCheck` line errors, a key/type is missing in `en.ts` — fix it.

- [ ] **Step 5: Commit**

```bash
git add apps/mobile/lib/i18n/
git commit -m "feat(i18n): add English dictionary and reactive useT() hook"
```

---

## Task 3: Migrate the 18 `fr` consumers to `useT()`

**Files (modify each):**
`app/(tabs)/index.tsx`, `app/(tabs)/explore.tsx`, `app/(tabs)/profile.tsx`,
`app/(tabs)/saved.tsx`, `app/(tabs)/_layout.tsx`, `app/opportunity/[id].tsx`,
`app/onboarding/index.tsx`, `app/onboarding/profile.tsx`,
`app/onboarding/interests.tsx`, `app/onboarding/done.tsx`,
`app/onboarding/account.tsx`, `components/explore/FilterSheet.tsx`,
`components/home/GreetingHeader.tsx`, `components/home/SearchBar.tsx`,
`components/home/FilterChips.tsx`, `components/cards/ApplicationCard.tsx`,
`components/profile/InterestChips.tsx`, `components/saved/ClosingThisWeekSheet.tsx`

- [ ] **Step 1: For each file, swap the import and add the hook**

In each file:
1. Replace `import { fr } from '@/lib/i18n/fr';` with `import { useT } from '@/lib/i18n';`
2. Add `const t = useT();` as the first line inside the component function body.
3. Replace every `fr.` with `t.`.

**Constraint — hook rules:** `useT()` may only be called inside a component (or
another hook). Before editing a file, grep for `fr.` usages that are at module
scope (outside any component) or inside non-component helpers. If found, instead
import `getDict` and call it at the use site, or thread `t` in as a parameter.
`FilterSheet` and `ClosingThisWeekSheet` are `forwardRef` components — put
`const t = useT();` at the top of the render function body (after existing hooks).

Run this to find module-scope risks before editing:
`cd apps/mobile && grep -rn "fr\\." app components | grep -v "useT\|i18n/fr"`

- [ ] **Step 2: Delete the now-unused direct re-export check**

`lib/i18n/fr.ts` keeps its `export const fr`. Do not delete it (en.ts and index.ts import it). Only the 18 consumers stop importing it directly.

- [ ] **Step 3: Typecheck + lint**

Run: `cd apps/mobile && npm run typecheck 2>&1 | grep -vE '^convex/'`
Expected: no errors referencing `app/` or `components/`.
Run: `npm run lint`
Expected: passes (no `react-hooks/rules-of-hooks` violations).

- [ ] **Step 4: Commit**

```bash
git add apps/mobile/app apps/mobile/components
git commit -m "refactor(i18n): migrate fr consumers to reactive useT() hook"
```

---

## Task 4: Dark-mode token mechanism

**Files:**
- Modify: `apps/mobile/global.css`
- Modify: `apps/mobile/tailwind.config.js`
- Modify: `apps/mobile/app/_layout.tsx`

- [ ] **Step 1: Add palette CSS variables to `global.css`**

Append a `@layer base` block defining every palette token as space-separated RGB
channels, for `:root` (light = current hex) and `.dark`. Convert the current hex
values to channels (e.g. `#F6F1E9` → `246 241 233`). Dark values below are a
sensible warm-dark palette; adjust during the phase-2 restyle.

```css
@layer base {
  :root {
    --color-paper: 246 241 233;
    --color-paper-card: 255 255 255;
    --color-paper-sunk: 239 233 222;
    --color-ink: 27 23 20;
    --color-ink-muted: 139 129 117;
    --color-ink-faint: 182 173 160;
    --color-line: 228 220 207;
    --color-line-strong: 216 207 191;
    --color-primary: 15 110 86;
    --color-primary-dark: 11 87 67;
    --color-primary-light: 230 242 238;
    --color-accent: 110 139 61;
    --color-accent-soft: 167 185 138;
    --color-urgency-red: 207 91 73;
    --color-urgency-amber: 201 149 46;
    --color-urgency-green: 110 139 61;
    --color-glow: 247 201 168;
  }
  .dark {
    --color-paper: 23 21 18;
    --color-paper-card: 33 30 26;
    --color-paper-sunk: 43 39 34;
    --color-ink: 240 236 230;
    --color-ink-muted: 168 160 149;
    --color-ink-faint: 120 113 104;
    --color-line: 52 47 41;
    --color-line-strong: 66 60 53;
    --color-primary: 45 168 138;
    --color-primary-dark: 30 130 105;
    --color-primary-light: 20 54 47;
    --color-accent: 142 173 92;
    --color-accent-soft: 95 122 60;
    --color-urgency-red: 224 122 102;
    --color-urgency-amber: 214 168 80;
    --color-urgency-green: 142 173 92;
    --color-glow: 120 78 52;
  }
}
```

(The category `cat.*` pastels are left as static hex in the config — they read
acceptably on dark and are part of phase-2 polish.)

- [ ] **Step 2: Update `tailwind.config.js`**

Add `darkMode: 'class',` at the top level of the config object, and convert the
`paper`, `ink`, `line`, `primary`, `accent`, `urgency`, and `glow` color tokens
to reference the CSS variables (keep `cat` and `fontFamily` unchanged):

```js
module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: 'rgb(var(--color-paper) / <alpha-value>)',
          card: 'rgb(var(--color-paper-card) / <alpha-value>)',
          sunk: 'rgb(var(--color-paper-sunk) / <alpha-value>)',
        },
        ink: {
          DEFAULT: 'rgb(var(--color-ink) / <alpha-value>)',
          muted: 'rgb(var(--color-ink-muted) / <alpha-value>)',
          faint: 'rgb(var(--color-ink-faint) / <alpha-value>)',
        },
        line: {
          DEFAULT: 'rgb(var(--color-line) / <alpha-value>)',
          strong: 'rgb(var(--color-line-strong) / <alpha-value>)',
        },
        primary: {
          DEFAULT: 'rgb(var(--color-primary) / <alpha-value>)',
          dark: 'rgb(var(--color-primary-dark) / <alpha-value>)',
          light: 'rgb(var(--color-primary-light) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'rgb(var(--color-accent) / <alpha-value>)',
          soft: 'rgb(var(--color-accent-soft) / <alpha-value>)',
        },
        urgency: {
          red: 'rgb(var(--color-urgency-red) / <alpha-value>)',
          amber: 'rgb(var(--color-urgency-amber) / <alpha-value>)',
          green: 'rgb(var(--color-urgency-green) / <alpha-value>)',
        },
        glow: 'rgb(var(--color-glow) / <alpha-value>)',
        // cat.* unchanged (static pastels)
        cat: { /* keep existing block verbatim */ },
      },
      fontFamily: { /* keep existing block verbatim */ },
    },
  },
};
```

- [ ] **Step 3: Add `ThemeSync` to `app/_layout.tsx`**

At the top of the file add imports:

```ts
import { colorScheme } from 'nativewind';
import { useSettings } from '@/lib/store/settings';
```

Add this component above `RootLayout`:

```ts
// Pushes the user's theme preference into NativeWind's colorScheme so `dark:`
// tokens (CSS variables) flip. 'system' lets NativeWind follow the device.
function ThemeSync() {
  const theme = useSettings((s) => s.theme);
  useEffect(() => {
    colorScheme.set(theme);
  }, [theme]);
  return null;
}
```

Mount `<ThemeSync />` inside `<Providers>` (e.g. just before `<StatusBar … />`).

- [ ] **Step 4: Typecheck + lint**

Run: `cd apps/mobile && npm run typecheck 2>&1 | grep -vE '^convex/'`
Expected: no errors.
Run: `npm run lint`
Expected: passes.

- [ ] **Step 5: Commit**

```bash
git add apps/mobile/global.css apps/mobile/tailwind.config.js apps/mobile/app/_layout.tsx
git commit -m "feat(theme): CSS-variable palette + dark mode mechanism via ThemeSync"
```

---

## Task 5: SettingsList toggle support + SettingSelectSheet

**Files:**
- Modify: `apps/mobile/components/profile/SettingsList.tsx`
- Create: `apps/mobile/components/profile/SettingSelectSheet.tsx`

- [ ] **Step 1: Extend `SettingsRow` + render a `Switch` when present**

In `SettingsList.tsx`, add `Switch` to the `react-native` import, extend the type,
and branch the trailing control:

```tsx
import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, Switch, Text, View } from 'react-native';

export type SettingsRow = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  toggle?: { value: boolean; onChange: (v: boolean) => void };
};

export function SettingsList({ rows }: { rows: SettingsRow[] }) {
  return (
    <View className="overflow-hidden rounded-card border border-line bg-paper-card">
      {rows.map((row, i) => (
        <Pressable
          key={row.label}
          onPress={row.toggle ? undefined : row.onPress}
          className={`flex-row items-center px-4 py-4 active:bg-paper-sunk ${
            i > 0 ? 'border-t border-line' : ''
          }`}>
          <View className="h-9 w-9 items-center justify-center rounded-full bg-paper-sunk">
            <Ionicons name={row.icon} size={18} color="#1B1714" />
          </View>
          <Text className="ml-3 flex-1 font-sans-medium text-base text-ink">{row.label}</Text>
          {row.toggle ? (
            <Switch
              value={row.toggle.value}
              onValueChange={row.toggle.onChange}
              trackColor={{ true: '#0F6E56', false: '#D8CFBF' }}
            />
          ) : (
            <>
              {row.value ? (
                <Text className="mr-1.5 font-sans text-sm text-ink-muted">{row.value}</Text>
              ) : null}
              <Ionicons name="chevron-forward" size={16} color="#B6ADA0" />
            </>
          )}
        </Pressable>
      ))}
    </View>
  );
}
```

(The icon/track hex stays for now — part of the phase-2 hardcoded-hex pass.)

- [ ] **Step 2: Create `SettingSelectSheet.tsx`**

```tsx
import Ionicons from '@expo/vector-icons/Ionicons';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { forwardRef, useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';

export type SelectOption<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  title: string;
  options: SelectOption<T>[];
  selected: T;
  onSelect: (value: T) => void;
};

// Reusable radio bottom sheet for single-choice settings (language, appearance).
// Mirrors components/explore/FilterSheet.tsx structure.
function SettingSelectSheetInner<T extends string>(
  { title, options, selected, onSelect }: Props<T>,
  ref: React.ForwardedRef<BottomSheetModal>,
) {
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.4} />
    ),
    [],
  );

  const dismiss = () => (ref as React.RefObject<BottomSheetModal | null>)?.current?.dismiss();

  return (
    <BottomSheetModal
      ref={ref}
      enableDynamicSizing
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: '#F6F1E9' }}
      handleIndicatorStyle={{ backgroundColor: '#D8CFBF' }}>
      <BottomSheetView style={{ paddingHorizontal: 20, paddingBottom: 36 }}>
        <Text className="mb-2 font-serif-bold text-2xl text-ink">{title}</Text>
        {options.map((opt) => {
          const active = opt.value === selected;
          return (
            <Pressable
              key={opt.value}
              onPress={() => {
                onSelect(opt.value);
                dismiss();
              }}
              className="flex-row items-center justify-between py-4 active:opacity-70">
              <Text className={`text-base ${active ? 'font-sans-semibold text-ink' : 'font-sans text-ink-muted'}`}>
                {opt.label}
              </Text>
              {active ? <Ionicons name="checkmark" size={20} color="#0F6E56" /> : null}
            </Pressable>
          );
        })}
      </BottomSheetView>
    </BottomSheetModal>
  );
}

export const SettingSelectSheet = forwardRef(SettingSelectSheetInner) as <T extends string>(
  props: Props<T> & { ref?: React.ForwardedRef<BottomSheetModal> },
) => ReturnType<typeof SettingSelectSheetInner>;
```

- [ ] **Step 3: Typecheck + lint**

Run: `cd apps/mobile && npm run typecheck 2>&1 | grep -vE '^convex/'`
Expected: no errors.
Run: `npm run lint`
Expected: passes.

- [ ] **Step 4: Commit**

```bash
git add apps/mobile/components/profile/SettingsList.tsx apps/mobile/components/profile/SettingSelectSheet.tsx
git commit -m "feat(settings): inline switch row + reusable select sheet"
```

---

## Task 6: Wire `profile.tsx`

**Files:**
- Modify: `apps/mobile/app/(tabs)/profile.tsx`

- [ ] **Step 1: Replace the screen with store-driven rows + sheets**

```tsx
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useRef } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { InterestChips } from '@/components/profile/InterestChips';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { SettingSelectSheet } from '@/components/profile/SettingSelectSheet';
import { SettingsList, type SettingsRow } from '@/components/profile/SettingsList';
import { StatsCard } from '@/components/profile/StatsCard';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { useT } from '@/lib/i18n';
import { useSettings, type Locale, type ThemePref } from '@/lib/store/settings';

export default function ProfileScreen() {
  const t = useT();
  const { locale, theme, notificationsEnabled, setLocale, setTheme, setNotificationsEnabled } =
    useSettings();

  const languageSheet = useRef<BottomSheetModal>(null);
  const appearanceSheet = useRef<BottomSheetModal>(null);

  const themeLabel: Record<ThemePref, string> = {
    light: t.profile.themeLight,
    dark: t.profile.themeDark,
    system: t.profile.themeSystem,
  };

  const settings: SettingsRow[] = [
    {
      icon: 'notifications-outline',
      label: t.profile.notifications,
      toggle: { value: notificationsEnabled, onChange: setNotificationsEnabled },
    },
    {
      icon: 'globe-outline',
      label: t.profile.language,
      value: locale === 'fr' ? t.profile.french : t.profile.english,
      onPress: () => languageSheet.current?.present(),
    },
    {
      icon: 'moon-outline',
      label: t.profile.appearance,
      value: themeLabel[theme],
      onPress: () => appearanceSheet.current?.present(),
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-paper" edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pt-4 pb-32">
        <ProfileHeader
          fullName="Kossi Adjavon"
          location="Lomé, Togo"
          age={22}
          bio="Étudiant L3 Informatique · Cherche Master à l'étranger 🌍"
        />

        <View className="mt-6">
          <StatsCard applications={12} accepted={3} saved={8} labels={t.profile.stats} />
        </View>

        <View className="mt-8 gap-3">
          <SectionLabel label={t.profile.interests} actionLabel={t.profile.edit} />
          <InterestChips interests={['Bourses', 'Master', 'Europe', 'Informatique', 'Anglais']} />
        </View>

        <View className="mt-8 gap-3">
          <SectionLabel label={t.profile.settings} />
          <SettingsList rows={settings} />
        </View>
      </ScrollView>

      <SettingSelectSheet<Locale>
        ref={languageSheet}
        title={t.profile.language}
        selected={locale}
        onSelect={setLocale}
        options={[
          { value: 'fr', label: t.profile.french },
          { value: 'en', label: t.profile.english },
        ]}
      />
      <SettingSelectSheet<ThemePref>
        ref={appearanceSheet}
        title={t.profile.appearance}
        selected={theme}
        onSelect={setTheme}
        options={[
          { value: 'light', label: t.profile.themeLight },
          { value: 'dark', label: t.profile.themeDark },
          { value: 'system', label: t.profile.themeSystem },
        ]}
      />
    </SafeAreaView>
  );
}
```

- [ ] **Step 2: Typecheck + lint**

Run: `cd apps/mobile && npm run typecheck 2>&1 | grep -vE '^convex/'`
Expected: no errors.
Run: `npm run lint`
Expected: passes.

- [ ] **Step 3: Commit**

```bash
git add apps/mobile/app/(tabs)/profile.tsx
git commit -m "feat(settings): wire profile rows to settings store + selector sheets"
```

---

## Task 7: Manual verification

**Files:** none (verification only)

- [ ] **Step 1: Run the app**

Run: `cd apps/mobile && npm run start` (then open in Expo Go / emulator / `w` for web).

- [ ] **Step 2: Verify each control**

- Profile → Notifications row shows a `Switch`; toggling it flips on/off and persists during the session.
- Profile → Langue → opens sheet → choosing **English** flips visible app text (tabs, home, saved, profile) to English; the row value updates to "English".
- Profile → Apparence → opens sheet → **Sombre** flips class-based surfaces (backgrounds, text, borders) to dark; **Clair** returns to light; **Système** follows the device.

- [ ] **Step 3: Final typecheck/lint gate**

Run: `cd apps/mobile && npm run typecheck 2>&1 | grep -vE '^convex/' ; npm run lint`
Expected: no app/component errors; lint passes.

---

## Phase-2 follow-up (NOT in this plan — tracked separately)

Hardcoded hex that bypasses tokens and won't flip in dark mode until restyled:
- Icon `color=` props across components (`#1B1714`, `#8B8175`, `#B6ADA0`, …).
- `LinearGradient` rgba (`FeaturedCard.tsx`, closing banner glow).
- `DeadlineNumeral` urgency colors; `CategoryBadge` pastels.
- `StatusBar style="dark"` + `Stack` `contentStyle.backgroundColor` in `_layout.tsx`.
- Bottom-sheet `backgroundStyle` / `handleIndicatorStyle` hardcoded hex (`FilterSheet`, `ClosingThisWeekSheet`, `SettingSelectSheet`).
- `Switch` track / select-check colors.
