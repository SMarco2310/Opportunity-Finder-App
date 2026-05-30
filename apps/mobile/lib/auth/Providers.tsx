import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import { ConvexReactClient } from 'convex/react';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import type { ReactNode } from 'react';

import { tokenCache } from './tokenCache';

// Auth + Convex realtime. Both EXPO_PUBLIC_CONVEX_URL and EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY
// must be in apps/mobile/.env.local (from `npx convex dev` + Clerk dashboard).
// Without them we skip providers so Expo Go still loads screens on mock data — useful
// for UI preview before backend keys exist.
const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL;
const clerkKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

export const authConfigured = Boolean(convexUrl && clerkKey);

const convexClient = convexUrl
  ? new ConvexReactClient(convexUrl, { unsavedChangesWarning: false })
  : null;

export function Providers({ children }: { children: ReactNode }) {
  if (!authConfigured || !convexClient || !clerkKey) {
    return <>{children}</>;
  }
  return (
    <ClerkProvider publishableKey={clerkKey} tokenCache={tokenCache}>
      <ConvexProviderWithClerk client={convexClient} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
