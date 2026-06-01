import Ionicons from '@expo/vector-icons/Ionicons';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ApplicationCard } from '@/components/cards/ApplicationCard';
import { ClosingThisWeekSheet } from '@/components/saved/ClosingThisWeekSheet';
import { SegmentedTabs } from '@/components/ui/SegmentedTabs';
import { fr } from '@/lib/i18n/fr';
import { useSavedApplications, type SavedStatus } from '@/lib/saved';

// Saved / Sauvés — application tracker. Actives / Brouillons / Expirées with a
// completion % per card and a "closing this week" banner. Mock-backed; swaps to
// useQuery(api.saves.listMine) once auth is live.
export default function SavedScreen() {
  const [tab, setTab] = useState<SavedStatus>('active');
  const { byStatus, counts, total, closing } = useSavedApplications();
  const items = byStatus[tab];
  const closingSheetRef = useRef<BottomSheetModal>(null);

  const empty =
    tab === 'active' ? fr.saved.emptyActive : tab === 'draft' ? fr.saved.emptyDraft : fr.saved.emptyExpired;

  return (
    <SafeAreaView className="flex-1 bg-paper" edges={['top']}>
      <View className="gap-4 px-5 pb-2 pt-3">
        <View>
          <Text className="font-serif-bold text-4xl text-ink">{fr.saved.title}</Text>
          <Text className="mt-1 font-sans text-base text-ink-muted">
            {fr.saved.count(total)} · {fr.saved.closingSoon(closing.count)}
          </Text>
        </View>

        <SegmentedTabs
          segments={[
            { key: 'active', label: fr.saved.tabActive, count: counts.active },
            { key: 'draft', label: fr.saved.tabDraft, count: counts.draft },
            { key: 'expired', label: fr.saved.tabExpired },
          ]}
          value={tab}
          onChange={setTab}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="gap-3 px-5 pb-32 pt-2">
        {/* Closing-this-week banner (active tab only) */}
        {tab === 'active' && closing.count > 0 ? (
          <Pressable
            onPress={() => closingSheetRef.current?.present()}
            className="flex-row items-center overflow-hidden rounded-card border border-glow active:opacity-90">
            <View className="absolute inset-0 bg-glow/30" />
            <View className="mx-4 h-2 w-2 rounded-full bg-urgency-red" />
            <View className="flex-1 py-3.5">
              <Text className="font-sans-bold text-base text-ink">
                {fr.saved.closingThisWeek(closing.count)}
              </Text>
              <Text className="font-sans text-sm text-ink-muted">{closing.names.join(' · ')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#8B8175" style={{ marginRight: 14 }} />
          </Pressable>
        ) : null}

        {items.length > 0 ? (
          items.map((item) => <ApplicationCard key={item._id} item={item} />)
        ) : (
          <Text className="py-16 text-center font-sans text-base text-ink-faint">{empty}</Text>
        )}
      </ScrollView>

      <ClosingThisWeekSheet ref={closingSheetRef} items={closing.items} />
    </SafeAreaView>
  );
}
