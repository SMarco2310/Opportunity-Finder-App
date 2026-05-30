import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, Text, View } from 'react-native';

import { CATEGORY_META, FUNDING_LABEL } from '@/lib/categories';
import { useFilters } from '@/lib/store/filters';

// Inline filter rows (Image #5): each row shows the active selection + a count
// badge; tapping any row opens the full filter sheet for editing.
function Row({
  label,
  value,
  count,
  chevron,
  onPress,
  first,
}: {
  label: string;
  value: string;
  count?: number;
  chevron?: boolean;
  onPress: () => void;
  first?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center px-4 py-3.5 active:bg-paper-sunk ${first ? '' : 'border-t border-line'}`}>
      <View className="flex-1">
        <Text className="font-sans-semibold text-[11px] tracking-[1.5px] text-ink-muted">{label}</Text>
        <Text className="mt-0.5 font-sans-medium text-base text-ink">{value}</Text>
      </View>
      {count && count > 0 ? (
        <View className="h-6 w-6 items-center justify-center rounded-full bg-accent">
          <Text className="font-sans-bold text-[11px] text-white">{count}</Text>
        </View>
      ) : chevron ? (
        <Ionicons name="chevron-forward" size={18} color="#B6ADA0" />
      ) : null}
    </Pressable>
  );
}

export function FilterSummary({ onOpen }: { onOpen: () => void }) {
  const { categories, fundingLevel, destination, educationLevel } = useFilters();

  const catValue =
    categories.length > 0 ? categories.map((c) => CATEGORY_META[c].chip).join(', ') : 'Toutes';

  return (
    <View className="overflow-hidden rounded-card border border-line bg-paper-card">
      <Row first label="CATÉGORIE" value={catValue} count={categories.length} onPress={onOpen} />
      <Row
        label="FINANCEMENT"
        value={fundingLevel ? FUNDING_LABEL[fundingLevel] : 'Tous'}
        count={fundingLevel ? 1 : 0}
        onPress={onOpen}
      />
      <Row
        label="DESTINATION"
        value={destination ?? 'Toutes'}
        count={destination ? 1 : 0}
        onPress={onOpen}
      />
      <Row
        label="NIVEAU"
        value={educationLevel ?? 'Tous'}
        count={educationLevel ? 1 : 0}
        onPress={onOpen}
      />
      <Row label="DATE LIMITE" value="Tous" chevron onPress={onOpen} />
    </View>
  );
}
