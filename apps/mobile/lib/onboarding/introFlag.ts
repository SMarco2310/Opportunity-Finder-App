// Tracks whether the splash/intro has been shown, so it only appears on the very
// first launch. Stored in SecureStore (already used for the Clerk token cache).

import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';

const KEY = 'of:introSeen';

export async function getIntroSeen(): Promise<boolean> {
  try {
    return (await SecureStore.getItemAsync(KEY)) === '1';
  } catch {
    return false;
  }
}

export async function setIntroSeen(): Promise<void> {
  try {
    await SecureStore.setItemAsync(KEY, '1');
  } catch {
    // Non-fatal: worst case the intro shows again next launch.
  }
}

// Reads the flag once. `loading` is true until the first read resolves so the
// gate can hold on the splash instead of flashing a wrong route.
export function useIntroSeen(): { introSeen: boolean; loading: boolean } {
  const [introSeen, setSeen] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    getIntroSeen().then((v) => {
      if (!active) return;
      setSeen(v);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);
  return { introSeen, loading };
}
