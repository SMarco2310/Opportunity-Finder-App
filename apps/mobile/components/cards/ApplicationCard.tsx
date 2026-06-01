import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { CategoryBadge } from '@/components/ui/CategoryBadge';
import { DeadlineNumeral } from '@/components/ui/DeadlineNumeral';
import { useT } from '@/lib/i18n';
import type { SavedApplication } from '@/lib/saved';

// Saved-tab card: tracks application progress. Category badge + deadline numeral,
// title, source, a progress bar, and a "% complété · Reprendre" footer.
export function ApplicationCard({
  item,
  onPress,
}: {
  item: SavedApplication;
  onPress?: () => void;
}) {
  const router = useRouter();
  const t = useT();

  return (
    <Pressable
      onPress={onPress ?? (() => router.push(`/opportunity/${item._id}`))}
      className="rounded-card border border-line bg-paper-card p-5 active:opacity-90">
      <View className="flex-row items-start justify-between">
        <CategoryBadge category={item.category} />
        <DeadlineNumeral deadlineAt={item.deadlineAt} />
      </View>

      <Text numberOfLines={1} className="mt-3 font-serif-bold text-xl text-ink">
        {item.title}
      </Text>
      <Text className="mt-1 font-sans text-sm text-ink-muted">{item.sourceName}</Text>

      {/* Progress bar */}
      <View className="mt-4 h-1.5 overflow-hidden rounded-pill bg-line">
        <View className="h-full rounded-pill bg-accent" style={{ width: `${item.progress}%` }} />
      </View>

      <View className="mt-3 flex-row items-center justify-between">
        <Text className="font-sans text-sm text-ink-muted">{t.saved.percentDone(item.progress)}</Text>
        <Text className="font-sans-semibold text-sm text-accent">{t.saved.resume} →</Text>
      </View>
    </Pressable>
  );
}
