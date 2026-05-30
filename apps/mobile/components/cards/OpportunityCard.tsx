import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { CategoryBadge } from '@/components/ui/CategoryBadge';
import { DeadlineNumeral } from '@/components/ui/DeadlineNumeral';
import { FUNDING_LABEL } from '@/lib/categories';
import type { FeedOpportunity } from '@/lib/feed';

// Standard feed card ("Pour toi" / search results). Category badge, two-line
// title, a source·location subtitle and a funding·duration meta row, with the
// deadline numeral floating top-right.
export function OpportunityCard({ item }: { item: FeedOpportunity }) {
  const router = useRouter();
  const funding = FUNDING_LABEL[item.fundingLevel];
  const subtitle = [item.sourceName, item.location].filter(Boolean).join(' · ');
  const meta = [funding, item.duration].filter(Boolean).join(' · ');

  return (
    <Pressable
      onPress={() => router.push(`/opportunity/${item._id}`)}
      className="rounded-card border border-line bg-paper-card p-5 active:opacity-90">
      <View className="flex-row items-start justify-between">
        <CategoryBadge category={item.category} />
        <DeadlineNumeral deadlineAt={item.deadlineAt} />
      </View>

      <Text numberOfLines={2} className="mt-3 font-serif-bold text-xl leading-tight text-ink">
        {item.title}
      </Text>

      {subtitle ? (
        <Text className="mt-2 font-sans text-sm text-ink-muted">{subtitle}</Text>
      ) : null}
      {meta ? <Text className="mt-1 font-sans text-sm text-ink-faint">{meta}</Text> : null}
    </Pressable>
  );
}
