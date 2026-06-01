// Pure routing decision for the app root gate. Kept side-effect-free so the
// branch logic can be reasoned about (and tested) in isolation from Clerk,
// Convex, and SecureStore.

export type OnboardingRoute =
  | '/onboarding'
  | '/onboarding/account'
  | '/onboarding/profile'
  | '/(tabs)';

export type RouteSignals = {
  /** User has seen the splash/intro at least once (local flag). */
  introSeen: boolean;
  /** Clerk + Convex keys present. When false the app runs on mock data. */
  authConfigured: boolean;
  /** Clerk reports an active session. */
  isSignedIn: boolean;
  /** Convex user row has `onboardingCompletedAt` set. */
  onboardingComplete: boolean;
};

// First launch shows the intro. With no backend keys we can't auth/persist, so
// after the intro we drop straight into the app on mock data. Otherwise: sign in,
// then finish the profile, then the app — each step resumable across restarts.
export function decideRoute(s: RouteSignals): OnboardingRoute {
  if (!s.introSeen) return '/onboarding';
  if (!s.authConfigured) return '/(tabs)';
  if (!s.isSignedIn) return '/onboarding/account';
  if (!s.onboardingComplete) return '/onboarding/profile';
  return '/(tabs)';
}
