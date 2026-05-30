import { Text, View } from 'react-native';

// A titled body section on the detail screen (À propos, Qui peut postuler, …).
export function DetailSection({ title, body }: { title: string; body: string }) {
  return (
    <View className="gap-2">
      <Text className="font-sans-semibold text-xs tracking-[2px] text-ink-muted">
        {title.toUpperCase()}
      </Text>
      <Text className="font-sans text-base leading-relaxed text-ink">{body}</Text>
    </View>
  );
}
