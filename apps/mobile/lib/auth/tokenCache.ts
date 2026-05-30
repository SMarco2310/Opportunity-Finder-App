import * as SecureStore from 'expo-secure-store';

// Persists the Clerk session token in the device keychain so the user stays
// logged in across app restarts (Step 2 DoD: force-quit → still signed in).
export const tokenCache = {
  async getToken(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async saveToken(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      // Ignore keychain write failures — Clerk will re-auth if the token is lost.
    }
  },
};
