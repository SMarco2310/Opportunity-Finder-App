import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import type { Category } from '@/lib/categories';

// In-memory draft shared across the onboarding steps (profile → interests →
// done). Lives only for the duration of the flow; the final values are handed to
// completeOnboarding when the user finishes. Provided at onboarding/_layout.
type Draft = {
  fullName: string;
  age: string; // kept as the raw text input; parsed to a number on submit.
  categories: Category[];
};

type DraftContext = {
  draft: Draft;
  setName: (v: string) => void;
  setAge: (v: string) => void;
  setCategories: (v: Category[]) => void;
};

const Ctx = createContext<DraftContext | null>(null);

const DEFAULT_CATEGORIES: Category[] = ['scholarships', 'fellowships', 'training'];

export function OnboardingDraftProvider({ children }: { children: ReactNode }) {
  const [fullName, setName] = useState('');
  const [age, setAge] = useState('');
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);

  const value = useMemo(
    () => ({ draft: { fullName, age, categories }, setName, setAge, setCategories }),
    [fullName, age, categories],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDraft(): DraftContext {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useDraft must be used within OnboardingDraftProvider');
  return ctx;
}
