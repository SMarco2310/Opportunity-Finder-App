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
