import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryCard } from '@/components/onboarding/CategoryCard';
import { CATEGORY_ORDER, type Category } from '@/lib/categories';
import { fr } from '@/lib/i18n/fr';

const STEP = 2;
const TOTAL = 4;

// Onboarding: interest picker (one of a 4-step flow). Selecting categories seeds
// the personalized feed. On continue this calls interests.set once auth is live;
// for now it just advances to the app.
export default function InterestsScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<Category[]>(['scholarships', 'fellowships', 'training']);

  const toggle = (c: Category) =>
    setSelected((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  const finish = () => router.replace('/(tabs)');

  return (
    <View className="flex-1 bg-paper">
      <LinearGradient
        colors={['#FBE7D7', '#F4EFE9', '#ECE7F1']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ position: 'absolute', inset: 0 }}
      />
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-6 pb-4">
          <Ionicons name="locate" size={28} color="#6E8B3D" style={{ marginTop: 8 }} />

          {/* Progress */}
          <Text className="mt-5 font-sans-semibold text-xs tracking-[2px] text-ink-muted">
            {fr.onboarding.step(STEP, TOTAL).toUpperCase()}
          </Text>
          <View className="mt-2 flex-row gap-1.5">
            {Array.from({ length: TOTAL }).map((_, i) => (
              <View
                key={i}
                className={`h-1.5 flex-1 rounded-pill ${i < STEP ? 'bg-accent' : 'bg-line'}`}
              />
            ))}
          </View>

          {/* Heading */}
          <Text className="mt-7 font-sans-medium text-base text-accent">
            {fr.onboarding.question}
          </Text>
          <Text className="mt-2 text-4xl leading-tight text-ink">
            <Text className="font-serif-bold">{fr.onboarding.titleLead} </Text>
            <Text className="font-serif-italic text-accent">{fr.onboarding.titleAccent} </Text>
            <Text className="font-serif-bold">{fr.onboarding.titleTail}</Text>
          </Text>
          <Text className="mt-3 font-sans text-base leading-snug text-ink-muted">
            {fr.onboarding.subtitle}
          </Text>

          {/* Grid */}
          <View className="mt-6 flex-row flex-wrap justify-between gap-y-3">
            {CATEGORY_ORDER.map((c) => (
              <CategoryCard
                key={c}
                category={c}
                selected={selected.includes(c)}
                onToggle={() => toggle(c)}
              />
            ))}
          </View>
        </ScrollView>

        {/* Bottom bar */}
        <View className="flex-row items-center gap-4 px-6 pb-2 pt-3">
          <Pressable onPress={finish} hitSlop={8} className="active:opacity-60">
            <Text className="font-sans-medium text-base text-ink-muted">{fr.onboarding.skip}</Text>
          </Pressable>
          <Pressable
            onPress={finish}
            disabled={selected.length === 0}
            className={`flex-1 flex-row items-center justify-center rounded-pill py-4 active:opacity-90 ${
              selected.length === 0 ? 'bg-accent/40' : 'bg-accent'
            }`}>
            <Text className="font-sans-bold text-base text-white">{fr.onboarding.continue}</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 6 }} />
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}
