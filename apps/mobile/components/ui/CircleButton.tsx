import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable } from 'react-native';

// Round white icon button used in the detail header (back / share / bookmark).
export function CircleButton({
  icon,
  onPress,
  color = '#1B1714',
}: {
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  color?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      className="h-11 w-11 items-center justify-center rounded-full border border-line bg-paper-card active:opacity-80">
      <Ionicons name={icon} size={20} color={color} />
    </Pressable>
  );
}
