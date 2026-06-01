import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';

// Top bar for the multi-step onboarding screens: a circular back button and a
// segmented progress indicator (filled up to `step` of `total`).
export function OnboardingProgress({ step, total }: { step: number; total: number }) {
  const router = useRouter();
  return (
    <View className="flex-row items-center gap-4 px-6 pt-2">
      <Pressable
        onPress={() => router.back()}
        hitSlop={8}
        className="h-10 w-10 items-center justify-center rounded-full bg-paper-card active:opacity-70"
        style={{
          shadowColor: '#1B1714',
          shadowOpacity: 0.06,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
          elevation: 2,
        }}>
        <Ionicons name="chevron-back" size={20} color="#1B1714" />
      </Pressable>
      <View className="flex-1 flex-row gap-2">
        {Array.from({ length: total }).map((_, i) => (
          <View
            key={i}
            className={`h-1.5 flex-1 rounded-pill ${i < step ? 'bg-accent' : 'bg-line'}`}
          />
        ))}
      </View>
    </View>
  );
}
