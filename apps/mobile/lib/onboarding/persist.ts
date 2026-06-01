// Persists the "onboarding complete" flag and submits the collected profile.
//
// The whole app currently runs on mock data (see lib/feed.ts etc.); Convex
// functions exist server-side but the client isn't wired yet. So for now we
// persist completion locally in SecureStore. When `npx convex dev` has generated
// `convex/_generated`, swap `completeOnboarding` for:
//
//   const run = useMutation(api.profile.completeOnboarding);
//   await run({ fullName, age, categories });
//
// and read the flag from `useQuery(api.users.me)?.onboardingCompletedAt` in the
// gate instead of the local store below.

import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';

import type { Category } from '@/lib/categories';

const KEY = 'of:onboardingComplete';

export async function getOnboardingComplete(): Promise<boolean> {
  try {
    return (await SecureStore.getItemAsync(KEY)) === '1';
  } catch {
    return false;
  }
}

export type ProfileSubmission = {
  fullName: string;
  age?: number;
  categories: Category[];
};

// Records the finished onboarding. Local-only today (see file header).
export async function completeOnboarding(_submission: ProfileSubmission): Promise<void> {
  try {
    await SecureStore.setItemAsync(KEY, '1');
  } catch {
    // Non-fatal; the gate falls back to showing onboarding again.
  }
}

// Reads the completion flag once. `loading` stays true until resolved so the
// gate can hold on the splash rather than flashing the wrong route.
export function useOnboardingComplete(): { complete: boolean; loading: boolean } {
  const [complete, setComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    getOnboardingComplete().then((v) => {
      if (!active) return;
      setComplete(v);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);
  return { complete, loading };
}
