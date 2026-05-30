import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, Text, View } from 'react-native';

import { fr } from '@/lib/i18n/fr';

// Tappable search field on Home — opens the Explore tab (no inline search here).
export function SearchBar({ onPress }: { onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center rounded-pill border border-line bg-paper-card px-4 py-3.5 active:opacity-90">
      <Ionicons name="search-outline" size={20} color="#8B8175" />
      <Text className="ml-3 flex-1 font-sans text-base text-ink-faint">
        {fr.home.searchPlaceholder}
      </Text>
      <View className="rounded-md border border-line px-1.5 py-0.5">
        <Text className="font-sans-medium text-[11px] text-ink-faint">⌘K</Text>
      </View>
    </Pressable>
  );
}
