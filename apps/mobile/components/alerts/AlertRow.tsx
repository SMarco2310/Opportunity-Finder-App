import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import type { Alert } from '@/lib/alerts';

// A single reminder in the Alerts list: channel icon, title, urgency line, the
// time it was sent, and an unread dot. Taps through to the opportunity.
export function AlertRow({ alert }: { alert: Alert }) {
  const router = useRouter();
  const isWhatsApp = alert.channel === 'whatsapp';

  return (
    <Pressable
      onPress={() => router.push(`/opportunity/${alert.opportunityId}`)}
      className="flex-row items-center rounded-card border border-line bg-paper-card p-4 active:opacity-90">
      <View
        className={`h-10 w-10 items-center justify-center rounded-full ${
          isWhatsApp ? 'bg-[#E3EFD9]' : 'bg-paper-sunk'
        }`}>
        <Ionicons
          name={isWhatsApp ? 'logo-whatsapp' : 'notifications'}
          size={20}
          color={isWhatsApp ? '#3E6B2E' : '#1B1714'}
        />
      </View>

      <View className="ml-3 flex-1">
        <Text numberOfLines={1} className="font-sans-semibold text-base text-ink">
          {alert.title}
        </Text>
        <Text className="mt-0.5 font-sans text-sm text-ink-muted">
          Ferme dans {alert.daysLeft} jours · {alert.sentLabel}
        </Text>
      </View>

      {!alert.read ? <View className="ml-2 h-2.5 w-2.5 rounded-full bg-accent" /> : null}
    </Pressable>
  );
}
