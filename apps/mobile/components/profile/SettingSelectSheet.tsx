import Ionicons from '@expo/vector-icons/Ionicons';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { forwardRef, useCallback } from 'react';
import { Pressable, Text } from 'react-native';

export type SelectOption<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  title: string;
  options: SelectOption<T>[];
  selected: T;
  onSelect: (value: T) => void;
};

// Reusable single-choice radio bottom sheet for settings (language, appearance).
// Mirrors components/explore/FilterSheet.tsx structure.
function SettingSelectSheetInner<T extends string>(
  { title, options, selected, onSelect }: Props<T>,
  ref: React.ForwardedRef<BottomSheetModal>,
) {
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
      enableDynamicSizing
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: '#F6F1E9' }}
      handleIndicatorStyle={{ backgroundColor: '#D8CFBF' }}>
      <BottomSheetView style={{ paddingHorizontal: 20, paddingBottom: 36 }}>
        <Text className="mb-2 font-serif-bold text-2xl text-ink">{title}</Text>
        {options.map((opt) => {
          const active = opt.value === selected;
          return (
            <Pressable
              key={opt.value}
              onPress={() => {
                onSelect(opt.value);
                dismiss();
              }}
              className="flex-row items-center justify-between py-4 active:opacity-70">
              <Text
                className={`text-base ${active ? 'font-sans-semibold text-ink' : 'font-sans text-ink-muted'}`}>
                {opt.label}
              </Text>
              {active ? <Ionicons name="checkmark" size={20} color="#0F6E56" /> : null}
            </Pressable>
          );
        })}
      </BottomSheetView>
    </BottomSheetModal>
  );
}

export const SettingSelectSheet = forwardRef(SettingSelectSheetInner) as <T extends string>(
  props: Props<T> & { ref?: React.ForwardedRef<BottomSheetModal> },
) => ReturnType<typeof SettingSelectSheetInner>;
