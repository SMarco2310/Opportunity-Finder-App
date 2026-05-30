import { Pressable, ScrollView, Text } from 'react-native';

import { CATEGORY_META, CATEGORY_ORDER, type Category } from '@/lib/categories';
import { fr } from '@/lib/i18n/fr';

// Horizontal category filter. "Tout" (null) plus the 8 categories. The active
// chip is a filled ink pill; the rest are hairline outlines.
export function FilterChips({
  active,
  onChange,
}: {
  active: Category | null;
  onChange: (category: Category | null) => void;
}) {
  const chips: { key: Category | null; label: string }[] = [
    { key: null, label: fr.categories.all },
    ...CATEGORY_ORDER.map((c) => ({ key: c, label: CATEGORY_META[c].chip })),
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-2.5 px-5">
      {chips.map((chip) => {
        const selected = chip.key === active;
        return (
          <Pressable
            key={chip.label}
            onPress={() => onChange(chip.key)}
            className={`rounded-pill border px-4 py-2 active:opacity-80 ${
              selected ? 'border-ink bg-ink' : 'border-line bg-transparent'
            }`}>
            <Text
              className={`font-sans-medium text-sm ${selected ? 'text-paper' : 'text-ink-muted'}`}>
              {chip.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
