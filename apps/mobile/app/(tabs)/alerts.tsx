import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AlertRow } from '@/components/alerts/AlertRow';
import { useAlerts } from '@/lib/alerts';

// Alerts / Alertes — history of deadline reminders sent via WhatsApp + push.
// Mock-backed; real data comes from the notifications table query (Step 11).
export default function AlertsScreen() {
  const { items } = useAlerts();

  return (
    <SafeAreaView className="flex-1 bg-paper" edges={['top']}>
      <View className="px-5 pb-2 pt-3">
        <Text className="text-3xl text-ink">
          <Text className="font-serif-bold">Tes</Text>
          <Text className="font-serif-italic"> alertes</Text>
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="gap-3 px-5 pb-32 pt-2">
        {items.length > 0 ? (
          items.map((alert) => <AlertRow key={alert._id} alert={alert} />)
        ) : (
          <Text className="py-16 text-center font-sans text-base text-ink-faint">
            Aucune alerte pour l’instant. Sauvegarde une opportunité pour recevoir des rappels.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
