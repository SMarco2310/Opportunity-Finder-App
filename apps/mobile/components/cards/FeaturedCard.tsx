import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { CategoryBadge } from '@/components/ui/CategoryBadge';
import { DeadlineNumeral } from '@/components/ui/DeadlineNumeral';
import { FUNDING_LABEL } from '@/lib/categories';
import type { FeedOpportunity } from '@/lib/feed';
import { initials, splitTrailingYear } from '@/lib/text';

// Hero card for "Ferme cette semaine": large serif title with the trailing year
// accented in olive, a warm coral glow bleeding from the top-right corner, and
// the source footer with an initials avatar.
export function FeaturedCard({ item }: { item: FeedOpportunity }) {
  const router = useRouter();
  const { head, year } = splitTrailingYear(item.title);
  const funding = FUNDING_LABEL[item.fundingLevel];
  const subtitle = [item.geographicScope, funding].filter(Boolean).join(' · ');

  return (
    <Pressable
      onPress={() => router.push(`/opportunity/${item._id}`)}
      className="overflow-hidden rounded-card border border-line bg-paper-card active:opacity-90">
      {/* Coral corner glow */}
      <LinearGradient
        colors={['rgba(247,201,168,0.6)', 'rgba(247,201,168,0)']}
        start={{ x: 1, y: 0 }}
        end={{ x: 0.15, y: 0.8 }}
        style={{ position: 'absolute', top: 0, right: 0, left: 0, bottom: 0 }}
        pointerEvents="none"
      />

      <View className="p-5">
        <View className="flex-row items-start justify-between">
          <CategoryBadge category={item.category} />
          <DeadlineNumeral deadlineAt={item.deadlineAt} size="lg" />
        </View>

        <Text className="mt-4 font-serif-bold text-3xl leading-tight text-ink">
          {head}
          {year ? <Text className="font-serif-italic text-accent"> {year}</Text> : null}
        </Text>

        {subtitle ? (
          <Text className="mt-2 font-sans text-base text-ink-muted">{subtitle}</Text>
        ) : null}

        <View className="mt-5 flex-row items-center">
          <View className="h-8 w-8 items-center justify-center rounded-full border border-line bg-paper">
            <Text className="font-sans-semibold text-[11px] text-ink-muted">
              {initials(item.sourceName)}
            </Text>
          </View>
          <Text className="ml-2 font-sans text-sm text-ink-muted">{item.sourceName}</Text>
          {item.applicants ? (
            <Text className="font-sans text-sm text-ink-faint"> · {item.applicants} candidats</Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}
