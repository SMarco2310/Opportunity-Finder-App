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
