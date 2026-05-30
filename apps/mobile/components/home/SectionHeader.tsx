import Ionicons from '@expo/vector-icons/Ionicons';
import { Text, View } from 'react-native';

// Section label row: a leading mark (coral dot or olive star), an uppercase
// tracked title, and an optional serif-italic count on the right.
export function SectionHeader({
  label,
  leading = 'dot',
  count,
}: {
  label: string;
  leading?: 'dot' | 'star';
  count?: number;
}) {
  return (
    <View className="flex-row items-center">
      {leading === 'dot' ? (
        <View className="mr-2.5 h-2 w-2 rounded-full bg-urgency-red" />
      ) : (
        <Ionicons name="star" size={14} color="#6E8B3D" style={{ marginRight: 8 }} />
      )}
      <Text className="flex-1 font-sans-semibold text-xs tracking-[2px] text-ink">
        {label.toUpperCase()}
      </Text>
      {typeof count === 'number' ? (
        <Text className="font-serif-italic text-lg text-ink-faint">{count}</Text>
      ) : null}
    </View>
  );
}
