import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { forwardRef, useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';

import { CATEGORY_META, CATEGORY_ORDER, FUNDING_LABEL, type FundingLevel } from '@/lib/categories';
import { useT } from '@/lib/i18n';
import { DESTINATIONS, EDUCATION_LEVELS, useFilters } from '@/lib/store/filters';

const FUNDING_OPTIONS: FundingLevel[] = ['fully_funded', 'partial', 'unfunded'];

// A pill toggle used throughout the sheet.
function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className={`rounded-pill border px-4 py-2 active:opacity-80 ${active ? 'border-ink bg-ink' : 'border-line'}`}>
      <Text className={`font-sans-medium text-sm ${active ? 'text-paper' : 'text-ink-muted'}`}>
        {label}
      </Text>
    </Pressable>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View className="mt-6">
      <Text className="font-sans-semibold text-xs tracking-[2px] text-ink-muted">{label}</Text>
      <View className="mt-3 flex-row flex-wrap gap-2.5">{children}</View>
    </View>
  );
}

// Filter bottom sheet (multi-select categories + single funding / destination /
// level), backed by the Zustand store so selections persist across tab switches.
export const FilterSheet = forwardRef<BottomSheetModal>(function FilterSheet(_props, ref) {
  const f = useFilters();
  const t = useT();

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.4} />
    ),
    [],
  );

  const dismiss = () => (ref as React.RefObject<BottomSheetModal | null>)?.current?.dismiss();

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={['85%']}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: '#F6F1E9' }}
      handleIndicatorStyle={{ backgroundColor: '#D8CFBF' }}>
      <BottomSheetScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}>
        <Text className="font-serif-bold text-2xl text-ink">{t.explore.filters}</Text>

        <Group label="CATÉGORIE">
          {CATEGORY_ORDER.map((c) => (
            <Chip
              key={c}
              label={CATEGORY_META[c].chip}
              active={f.categories.includes(c)}
              onPress={() => f.toggleCategory(c)}
            />
          ))}
        </Group>

        <Group label="FINANCEMENT">
          {FUNDING_OPTIONS.map((opt) => (
            <Chip
              key={opt}
              label={FUNDING_LABEL[opt]}
              active={f.fundingLevel === opt}
              onPress={() => f.setFundingLevel(f.fundingLevel === opt ? null : opt)}
            />
          ))}
        </Group>

        <Group label="DESTINATION">
          {DESTINATIONS.map((d) => (
            <Chip
              key={d}
              label={d}
              active={f.destination === d}
              onPress={() => f.setDestination(f.destination === d ? null : d)}
            />
          ))}
        </Group>

        <Group label="NIVEAU">
          {EDUCATION_LEVELS.map((lvl) => (
            <Chip
              key={lvl}
              label={lvl}
              active={f.educationLevel === lvl}
              onPress={() => f.setEducationLevel(f.educationLevel === lvl ? null : lvl)}
            />
          ))}
        </Group>

        <View className="mt-8 flex-row gap-3">
          <Pressable
            onPress={f.reset}
            className="flex-1 items-center rounded-pill border border-line py-4 active:opacity-80">
            <Text className="font-sans-semibold text-base text-ink">{t.common.reset}</Text>
          </Pressable>
          <Pressable
            onPress={dismiss}
            className="flex-1 items-center rounded-pill bg-primary py-4 active:opacity-90">
            <Text className="font-sans-semibold text-base text-white">{t.common.apply}</Text>
          </Pressable>
        </View>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});
