import { Pressable, Text, View } from 'react-native';

// Plain uppercase tracked section label with an optional right-aligned action
// (e.g. "Modifier"). Used on the Profile and Explore screens.
export function SectionLabel({
  label,
  actionLabel,
  onAction,
}: {
  label: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="font-sans-semibold text-xs tracking-[2px] text-ink-muted">
        {label.toUpperCase()}
      </Text>
      {actionLabel ? (
        <Pressable onPress={onAction} hitSlop={8} className="active:opacity-70">
          <Text className="font-sans-medium text-sm text-accent">{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
