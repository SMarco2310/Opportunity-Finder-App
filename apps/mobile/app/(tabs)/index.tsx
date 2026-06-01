import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FeaturedCard } from '@/components/cards/FeaturedCard';
import { OpportunityCard } from '@/components/cards/OpportunityCard';
import { FilterChips } from '@/components/home/FilterChips';
import { GreetingHeader } from '@/components/home/GreetingHeader';
import { SearchBar } from '@/components/home/SearchBar';
import { SectionHeader } from '@/components/home/SectionHeader';
import type { Category } from '@/lib/categories';
import { useHomeFeed } from '@/lib/feed';
import { useT } from '@/lib/i18n';

// Home / Accueil — the real-time personalized feed. Currently fed by mock data
// (lib/feed.ts); swap useHomeFeed for the Convex query once the backend is live.
export default function HomeScreen() {
  const router = useRouter();
  const t = useT();
  const [category, setCategory] = useState<Category | null>(null);
  const { closingThisWeek, forYou } = useHomeFeed(category ?? undefined);

  return (
    <SafeAreaView className="flex-1 bg-paper" edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-32">
        <View className="gap-4 px-5 pt-2">
          {/* TODO(Step 2): pull name/alerts from the Clerk/Convex user. */}
          <GreetingHeader
            firstName="Kossi"
            lastName="Adjavon"
            hasAlerts
            onPressBell={() => router.push('/alerts')}
          />
          <SearchBar onPress={() => router.push('/explore')} />
        </View>

        <View className="mt-4">
          <FilterChips active={category} onChange={setCategory} />
        </View>

        {closingThisWeek.length > 0 ? (
          <View className="mt-7 gap-3 px-5">
            <SectionHeader
              label={t.home.closingThisWeek}
              leading="dot"
              count={closingThisWeek.length}
            />
            {closingThisWeek.map((item) => (
              <FeaturedCard key={item._id} item={item} />
            ))}
          </View>
        ) : null}

        <View className="mt-8 gap-3 px-5">
          <SectionHeader label={t.home.forYou} leading="star" />
          {forYou.length > 0 ? (
            forYou.map((item) => <OpportunityCard key={item._id} item={item} />)
          ) : (
            <Text className="py-8 text-center font-sans text-sm text-ink-faint">
              {t.explore.emptyState}
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
