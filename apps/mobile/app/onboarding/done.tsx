import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OnboardingBackground } from '@/components/onboarding/OnboardingBackground';
import { useDraft } from '@/lib/onboarding/draft';
import { fr } from '@/lib/i18n/fr';

const t = fr.onboarding.done;
// Static match count for now — a real "matched opportunities" query can replace
// this once the feed is wired to Convex (see lib/feed.ts).
const MATCH_COUNT = 47;

// Final step — confirmation. Greets the user by first name, then drops into the
// app. No back gesture (configured in the stack) so it's a one-way exit.
export default function DoneScreen() {
  const router = useRouter();
  const { draft } = useDraft();
  const firstName = draft.fullName.trim().split(/\s+/)[0] || '';

  return (
    <View className="flex-1 bg-paper">
      <OnboardingBackground />
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <View className="flex-1 items-center justify-center px-8">
          <View className="h-44 w-44 items-center justify-center rounded-full border border-accent/30">
            <View className="h-24 w-24 items-center justify-center rounded-full bg-accent">
              <Ionicons name="checkmark" size={48} color="#F6F1E9" />
            </View>
          </View>

          <Text className="mt-8 text-center text-4xl leading-tight text-ink">
            <Text className="font-serif-bold">{t.titleLead} </Text>
            <Text className="font-serif-italic text-accent">{firstName}</Text>
            <Text className="font-serif-bold">.</Text>
          </Text>
          <Text className="mt-3 text-center font-sans text-base leading-snug text-ink-muted">
            {t.subtitle(MATCH_COUNT)}
          </Text>

          <Pressable
            onPress={() => router.replace('/(tabs)')}
            className="mt-8 h-14 w-full flex-row items-center justify-center rounded-pill bg-accent active:opacity-90">
            <Text className="font-sans-bold text-base text-white">{t.cta}</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 6 }} />
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}
