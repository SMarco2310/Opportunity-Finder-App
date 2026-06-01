import Ionicons from '@expo/vector-icons/Ionicons';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

// White pill OAuth button (Google / Apple) for the create-account step.
export function AuthButton({
  icon,
  iconColor,
  label,
  onPress,
  busy,
  disabled,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  label: string;
  onPress: () => void;
  busy?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={busy || disabled}
      className={`h-14 flex-row items-center justify-center rounded-card border border-line bg-paper-card active:opacity-90 ${
        disabled ? 'opacity-50' : ''
      }`}>
      {busy ? (
        <ActivityIndicator color="#1B1714" />
      ) : (
        <View className="flex-row items-center">
          <Ionicons name={icon} size={20} color={iconColor} />
          <Text className="ml-3 font-sans-semibold text-base text-ink">{label}</Text>
        </View>
      )}
    </Pressable>
  );
}
