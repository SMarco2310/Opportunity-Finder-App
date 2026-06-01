import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, Text, View } from 'react-native';

import { useT } from '@/lib/i18n';

// Editorial masthead: small tracked label over a large serif name (first name
// bold, last name italic), with a bell that carries a green unread dot.
export function GreetingHeader({
  firstName,
  lastName,
  hasAlerts = false,
  onPressBell,
}: {
  firstName?: string;
  lastName?: string;
  hasAlerts?: boolean;
  onPressBell?: () => void;
}) {
  const t = useT();
  const label = firstName ? `${t.auth.greeting},` : `${t.auth.welcomeAnon},`;

  return (
    <View className="flex-row items-start justify-between">
      <View className="flex-1 pr-3">
        <Text className="font-sans-medium text-xs tracking-[2px] text-ink-muted">
          {label.toUpperCase()}
        </Text>
        <Text className="mt-1 text-4xl leading-tight text-ink">
          <Text className="font-serif-bold">{firstName ?? 'Sur'}</Text>
          {lastName ? <Text className="font-serif-italic"> {lastName}</Text> : null}
          {!firstName ? <Text className="font-serif-italic"> Opportunity Finder</Text> : null}
        </Text>
      </View>

      <Pressable
        onPress={onPressBell}
        className="h-12 w-12 items-center justify-center rounded-full border border-line bg-paper-card active:opacity-80">
        <Ionicons name="notifications-outline" size={22} color="#1B1714" />
        {hasAlerts ? (
          <View className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full border border-paper-card bg-accent" />
        ) : null}
      </Pressable>
    </View>
  );
}
