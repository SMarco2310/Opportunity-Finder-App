import Ionicons from '@expo/vector-icons/Ionicons';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import { forwardRef, useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';

import { ApplicationCard } from '@/components/cards/ApplicationCard';
import { CircleButton } from '@/components/ui/CircleButton';
import { fr } from '@/lib/i18n/fr';
import type { SavedApplication } from '@/lib/saved';

// Bottom sheet listing the applications closing this week. Reuses ApplicationCard
// for each row; tapping a card dismisses the sheet then opens its detail.
export const ClosingThisWeekSheet = forwardRef<BottomSheetModal, { items: SavedApplication[] }>(
  function ClosingThisWeekSheet({ items }, ref) {
    const router = useRouter();

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.4} />
      ),
      [],
    );

    const dismiss = () => (ref as React.RefObject<BottomSheetModal | null>)?.current?.dismiss();

    const openDetail = (id: string) => {
      dismiss();
      router.push(`/opportunity/${id}`);
    };

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={['75%']}
        enableDynamicSizing={false}
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: '#F6F1E9' }}
        handleIndicatorStyle={{ backgroundColor: '#D8CFBF' }}>
        <BottomSheetScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}>
          {/* Header */}
          <View className="flex-row items-start gap-4">
            <View className="h-14 w-14 items-center justify-center rounded-2xl bg-glow">
              <Ionicons name="time-outline" size={26} color="#C2410C" />
            </View>
            <View className="flex-1">
              <Text className="font-serif-bold text-2xl leading-tight text-ink">
                {fr.saved.closingSheetTitle}
              </Text>
              <Text className="mt-1 font-sans text-base text-ink-muted">
                {fr.saved.closingSheetSubtitle}
              </Text>
            </View>
            <CircleButton icon="close" onPress={dismiss} />
          </View>

          {/* Closing applications */}
          <View className="mt-6 gap-3">
            {items.map((item) => (
              <ApplicationCard key={item._id} item={item} onPress={() => openDetail(item._id)} />
            ))}
          </View>

          {/* Dismiss */}
          <Pressable onPress={dismiss} className="mt-6 items-center py-2 active:opacity-70">
            <Text className="font-sans-medium text-base text-ink-muted">{fr.saved.later}</Text>
          </Pressable>
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  },
);
