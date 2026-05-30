import { Pressable, Text, View } from 'react-native';

// Two-or-more segment switcher (pill container with a filled active segment).
// Optional per-segment count badge (used by the Saved tab).
export function SegmentedTabs<T extends string>({
  segments,
  value,
  onChange,
}: {
  segments: { key: T; label: string; count?: number }[];
  value: T;
  onChange: (key: T) => void;
}) {
  return (
    <View className="flex-row rounded-pill bg-paper-sunk p-1">
      {segments.map((seg) => {
        const active = seg.key === value;
        return (
          <Pressable
            key={seg.key}
            onPress={() => onChange(seg.key)}
            className={`flex-1 flex-row items-center justify-center rounded-pill py-2.5 ${
              active ? 'bg-paper-card' : ''
            }`}>
            <Text className={`font-sans-semibold text-sm ${active ? 'text-ink' : 'text-ink-muted'}`}>
              {seg.label}
            </Text>
            {typeof seg.count === 'number' ? (
              <View className="ml-1.5 rounded-full bg-accent/15 px-1.5">
                <Text className="font-sans-semibold text-[11px] text-accent">{seg.count}</Text>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}
