import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { InterestChips } from '@/components/profile/InterestChips';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { SettingsList, type SettingsRow } from '@/components/profile/SettingsList';
import { StatsCard } from '@/components/profile/StatsCard';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { fr } from '@/lib/i18n/fr';

// Profile / Profil. Identity, stats, interests and settings. Currently static
// mock data; bound to the Convex user (interests.set, saves counts) post-auth.
// Profile editing beyond initial signup is post-MVP — rows are display-only.
export default function ProfileScreen() {
  const settings: SettingsRow[] = [
    { icon: 'notifications-outline', label: fr.profile.notifications, value: fr.profile.on },
    { icon: 'globe-outline', label: fr.profile.language, value: fr.profile.french },
    { icon: 'moon-outline', label: fr.profile.appearance, value: fr.profile.dark },
  ];

  return (
    <SafeAreaView className="flex-1 bg-paper" edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pt-4 pb-32">
        <ProfileHeader
          fullName="Kossi Adjavon"
          location="Lomé, Togo"
          age={22}
          bio="Étudiant L3 Informatique · Cherche Master à l'étranger 🌍"
        />

        <View className="mt-6">
          <StatsCard
            applications={12}
            accepted={3}
            saved={8}
            labels={fr.profile.stats}
          />
        </View>

        <View className="mt-8 gap-3">
          <SectionLabel label={fr.profile.interests} actionLabel={fr.profile.edit} />
          <InterestChips interests={['Bourses', 'Master', 'Europe', 'Informatique', 'Anglais']} />
        </View>

        <View className="mt-8 gap-3">
          <SectionLabel label={fr.profile.settings} />
          <SettingsList rows={settings} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
