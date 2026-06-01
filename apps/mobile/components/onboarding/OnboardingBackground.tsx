import { LinearGradient } from 'expo-linear-gradient';

// Soft warm-paper gradient shared by every onboarding screen (subtle peach at
// the top fading to cream then a hint of lilac), matching the mock backdrops.
export function OnboardingBackground() {
  return (
    <LinearGradient
      colors={['#FBE7D7', '#F4EFE9', '#ECE7F1']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={{ position: 'absolute', inset: 0 }}
    />
  );
}
