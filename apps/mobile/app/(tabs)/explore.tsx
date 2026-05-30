import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRef } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OpportunityCard } from '@/components/cards/OpportunityCard';
import { FilterSheet } from '@/components/explore/FilterSheet';
import { FilterSummary } from '@/components/explore/FilterSummary';
import { fr } from '@/lib/i18n/fr';
import { useSearch } from '@/lib/search';
import { useDebounce } from '@/lib/useDebounce';
import { useFilters } from '@/lib/store/filters';

// Explore / Explorer — keyword search + inline filter rows (Image #5). Filter
// state lives in Zustand (survives tab switches); the query is debounced 300ms.
export default function ExploreScreen() {
  const { searchTerm, categories, fundingLevel, setSearchTerm } = useFilters();
  const debounced = useDebounce(searchTerm, 300);
  const { results } = useSearch({ searchTerm: debounced, categories, fundingLevel });
  const sheetRef = useRef<BottomSheetModal>(null);

  return (
    <SafeAreaView className="flex-1 bg-paper" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-center px-5 py-2">
        <Text className="font-sans-semibold text-lg text-ink">{fr.tabs.explore}</Text>
        <Pressable
          onPress={() => sheetRef.current?.present()}
          className="absolute right-5 h-10 w-10 items-center justify-center rounded-full border border-line bg-paper-card active:opacity-80">
          <Ionicons name="options-outline" size={18} color="#1B1714" />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-32">
        {/* Search field */}
        <View className="flex-row items-center rounded-card border border-line bg-paper-card px-4 py-3.5">
          <Ionicons name="search-outline" size={20} color="#8B8175" />
          <TextInput
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholder={fr.home.searchPlaceholder}
            placeholderTextColor="#B6ADA0"
            returnKeyType="search"
            className="ml-2 flex-1 font-sans text-base text-ink"
          />
          {searchTerm.length > 0 ? (
            <Pressable onPress={() => setSearchTerm('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color="#B6ADA0" />
            </Pressable>
          ) : null}
        </View>

        {/* Filter rows */}
        <View className="mt-5">
          <FilterSummary onOpen={() => sheetRef.current?.present()} />
        </View>

        {/* Results */}
        <View className="mt-7 flex-row items-center justify-between">
          <Text className="font-sans-semibold text-xs tracking-[2px] text-ink-muted">RÉSULTATS</Text>
          <Text className="font-serif-italic text-lg text-ink-faint">{results.length}</Text>
        </View>

        <View className="mt-3 gap-3">
          {results.length > 0 ? (
            results.map((item) => <OpportunityCard key={item._id} item={item} />)
          ) : (
            <Text className="py-16 text-center font-sans text-base leading-relaxed text-ink-faint">
              {fr.explore.emptyState}
            </Text>
          )}
        </View>
      </ScrollView>

      <FilterSheet ref={sheetRef} />
    </SafeAreaView>
  );
}
