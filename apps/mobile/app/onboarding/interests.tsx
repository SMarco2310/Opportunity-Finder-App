import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OnboardingBackground } from '@/components/onboarding/OnboardingBackground';
import { OnboardingHeader } from '@/components/onboarding/OnboardingHeader';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import { CategoryCard } from '@/components/onboarding/CategoryCard';
import { CATEGORY_ORDER, type Category } from '@/lib/categories';
import { useDraft } from '@/lib/onboarding/draft';
import { completeOnboarding } from '@/lib/onboarding/persist';
import { fr } from '@/lib/i18n/fr';

const t = fr.onboarding.interests;

// Step 3/3 — interest picker. Selecting categories seeds the personalized feed.
// On continue we submit the whole draft (name, age, categories) and advance to
// the done screen.
export default function InterestsScreen() {
  const router = useRouter();
  const { draft, setCategories } = useDraft();
  const [busy, setBusy] = useState(false);

  const toggle = (c: Category) =>
    setCategories(
      draft.categories.includes(c)
        ? draft.categories.filter((x) => x !== c)
        : [...draft.categories, c],
    );

  const finish = async () => {
    if (draft.categories.length === 0 || busy) return;
    setBusy(true);
    const parsedAge = parseInt(draft.age, 10);
    await completeOnboarding({
      fullName: draft.fullName.trim(),
      age: Number.isFinite(parsedAge) ? parsedAge : undefined,
      categories: draft.categories,
    });
    router.replace('/onboarding/done');
  };

  return (
    <View className="flex-1 bg-paper">
      <OnboardingBackground />
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <OnboardingProgress step={3} total={3} />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-6 pt-6 pb-4">
          <OnboardingHeader
            eyebrow={t.eyebrow}
            titleLead={t.titleLead}
            titleAccent={t.titleAccent}
            titleTail={t.titleTail}
            subtitle={t.subtitle}
          />
          <View className="mt-6 flex-row flex-wrap justify-between gap-y-3">
            {CATEGORY_ORDER.map((c) => (
              <CategoryCard
                key={c}
                category={c}
                selected={draft.categories.includes(c)}
                onToggle={() => toggle(c)}
              />
            ))}
          </View>
        </ScrollView>

        <View className="px-6 pb-2 pt-3">
          <Pressable
            onPress={finish}
            disabled={draft.categories.length === 0 || busy}
            className={`h-14 flex-row items-center justify-center rounded-pill active:opacity-90 ${
              draft.categories.length === 0 ? 'bg-accent/40' : 'bg-accent'
            }`}>
            <Text className="font-sans-bold text-base text-white">
              {t.continueWith(draft.categories.length)}
            </Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 6 }} />
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}
