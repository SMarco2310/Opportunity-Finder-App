import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, Text, View } from 'react-native';

export type SettingsRow = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  onPress?: () => void;
};

// Grouped settings card: icon · label · value · chevron, hairline-separated.
export function SettingsList({ rows }: { rows: SettingsRow[] }) {
  return (
    <View className="overflow-hidden rounded-card border border-line bg-paper-card">
      {rows.map((row, i) => (
        <Pressable
          key={row.label}
          onPress={row.onPress}
          className={`flex-row items-center px-4 py-4 active:bg-paper-sunk ${
            i > 0 ? 'border-t border-line' : ''
          }`}>
          <View className="h-9 w-9 items-center justify-center rounded-full bg-paper-sunk">
            <Ionicons name={row.icon} size={18} color="#1B1714" />
          </View>
          <Text className="ml-3 flex-1 font-sans-medium text-base text-ink">{row.label}</Text>
          <Text className="mr-1.5 font-sans text-sm text-ink-muted">{row.value}</Text>
          <Ionicons name="chevron-forward" size={16} color="#B6ADA0" />
        </Pressable>
      ))}
    </View>
  );
}
