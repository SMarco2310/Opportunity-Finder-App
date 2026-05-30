import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, Text, View } from 'react-native';

import { CATEGORY_META, type Category } from '@/lib/categories';

// Selectable category card for the onboarding interest picker. Selected state
// gets an olive border + tinted background and a green check badge.
export function CategoryCard({
  category,
  selected,
  onToggle,
}: {
  category: Category;
  selected: boolean;
  onToggle: () => void;
}) {
  const meta = CATEGORY_META[category];
  return (
    <Pressable
      onPress={onToggle}
      style={{ width: '48%' }}
      className={`rounded-card border p-4 active:opacity-90 ${
        selected ? 'border-2 border-accent bg-paper' : 'border-line bg-paper-card'
      }`}>
      <View className="flex-row items-start justify-between">
        <Text className="text-2xl">{meta.emoji}</Text>
        {selected ? (
          <View className="h-6 w-6 items-center justify-center rounded-full bg-accent">
            <Ionicons name="checkmark" size={14} color="#fff" />
          </View>
        ) : null}
      </View>
      <Text className="mt-3 font-sans-bold text-lg text-ink">{meta.chip}</Text>
      <Text className="mt-0.5 font-sans text-sm text-ink-muted">{meta.blurb}</Text>
    </Pressable>
  );
}
