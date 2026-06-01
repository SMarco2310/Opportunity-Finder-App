import { Stack } from 'expo-router';

import { OnboardingDraftProvider } from '@/lib/onboarding/draft';

// Onboarding step stack. Headerless; each screen draws its own gradient and
// progress bar. Splash/intro lives at `index`, then account → profile →
// interests → done. The draft provider carries name/age/categories across steps.
export default function OnboardingLayout() {
  return (
    <OnboardingDraftProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#F6F1E9' },
          animation: 'slide_from_right',
        }}>
        <Stack.Screen name="index" options={{ animation: 'fade' }} />
        <Stack.Screen name="account" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="interests" />
        <Stack.Screen name="done" options={{ gestureEnabled: false, animation: 'fade' }} />
      </Stack>
    </OnboardingDraftProvider>
  );
}
