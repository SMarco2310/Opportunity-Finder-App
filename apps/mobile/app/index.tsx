import { useAuth } from '@clerk/clerk-expo';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Redirect } from 'expo-router';
import { Text, View } from 'react-native';

import { authConfigured } from '@/lib/auth/Providers';
import { useIntroSeen } from '@/lib/onboarding/introFlag';
import { useOnboardingComplete } from '@/lib/onboarding/persist';
import { decideRoute, type OnboardingRoute } from '@/lib/onboarding/route';

// App root gate. Resolves where to send the user — intro, account, profile, or
// the app — from the intro flag, auth session, and onboarding-complete flag.
// Holds on the brand splash while those signals resolve so there's no flash of
// the wrong screen. Clerk hooks throw without a provider (mock mode), so the
// authed path is isolated behind authConfigured.
export default function Index() {
  return authConfigured ? <AuthedGate /> : <MockGate />;
}

function AuthedGate() {
  const { isSignedIn, isLoaded } = useAuth();
  const intro = useIntroSeen();
  // TODO: once convex/_generated exists, source this from
  // useQuery(api.users.me)?.onboardingCompletedAt instead of the local flag.
  const done = useOnboardingComplete();

  if (!isLoaded || intro.loading || done.loading) return <Splash />;
  return (
    <Redirect
      href={decideRoute({
        introSeen: intro.introSeen,
        authConfigured: true,
        isSignedIn: Boolean(isSignedIn),
        onboardingComplete: done.complete,
      })}
    />
  );
}

function MockGate() {
  const intro = useIntroSeen();
  const done = useOnboardingComplete();
  if (intro.loading || done.loading) return <Splash />;
  const href: OnboardingRoute = decideRoute({
    introSeen: intro.introSeen,
    authConfigured: false,
    isSignedIn: false,
    onboardingComplete: done.complete,
  });
  return <Redirect href={href} />;
}

// Minimal branded splash shown while the gate resolves (matches the onboarding
// intro splash so the handoff is seamless).
function Splash() {
  return (
    <View className="flex-1 items-center justify-center bg-accent">
      <Ionicons name="locate" size={64} color="#F6F1E9" />
      <Text className="mt-6 text-center font-serif-bold text-4xl leading-tight text-paper">
        {'Opportunity\nFinder'}
      </Text>
    </View>
  );
}
