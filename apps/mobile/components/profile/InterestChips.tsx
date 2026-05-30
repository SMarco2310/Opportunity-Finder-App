import { Pressable, Text, View } from 'react-native';

import { fr } from '@/lib/i18n/fr';

// Soft olive interest pills plus a "+ Ajouter" outline pill. Display-only for
// MVP; editing the interest set is wired with interests.set in Step 11.
export function InterestChips({
  interests,
  onAdd,
}: {
  interests: string[];
  onAdd?: () => void;
}) {
  return (
    <View className="flex-row flex-wrap gap-2.5">
      {interests.map((interest) => (
        <View key={interest} className="rounded-pill bg-accent/10 px-4 py-2">
          <Text className="font-sans-medium text-sm text-accent">{interest}</Text>
        </View>
      ))}
      <Pressable
        onPress={onAdd}
        className="rounded-pill border border-line px-4 py-2 active:opacity-70">
        <Text className="font-sans-medium text-sm text-ink-muted">{fr.profile.addInterest}</Text>
      </Pressable>
    </View>
  );
}
