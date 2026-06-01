import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useRef } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { InterestChips } from '@/components/profile/InterestChips';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { SettingSelectSheet } from '@/components/profile/SettingSelectSheet';
import { SettingsList, type SettingsRow } from '@/components/profile/SettingsList';
import { StatsCard } from '@/components/profile/StatsCard';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { useT } from '@/lib/i18n';
import { useSettings, type Locale, type ThemePref } from '@/lib/store/settings';

// Profile / Profil. Identity, stats, interests and settings. Identity is static
// mock data (bound to the Convex user post-auth); the settings rows are live,
// backed by lib/store/settings.ts.
export default function ProfileScreen() {
  const t = useT();
  const { locale, theme, notificationsEnabled, setLocale, setTheme, setNotificationsEnabled } =
    useSettings();

  const languageSheet = useRef<BottomSheetModal>(null);
  const appearanceSheet = useRef<BottomSheetModal>(null);

  const themeLabel: Record<ThemePref, string> = {
    light: t.profile.themeLight,
    dark: t.profile.themeDark,
    system: t.profile.themeSystem,
  };

  const settings: SettingsRow[] = [
    {
      icon: 'notifications-outline',
      label: t.profile.notifications,
      toggle: { value: notificationsEnabled, onChange: setNotificationsEnabled },
    },
    {
      icon: 'globe-outline',
      label: t.profile.language,
      value: locale === 'fr' ? t.profile.french : t.profile.english,
      onPress: () => languageSheet.current?.present(),
    },
    {
      icon: 'moon-outline',
      label: t.profile.appearance,
      value: themeLabel[theme],
      onPress: () => appearanceSheet.current?.present(),
    },
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
          <StatsCard applications={12} accepted={3} saved={8} labels={t.profile.stats} />
        </View>

        <View className="mt-8 gap-3">
          <SectionLabel label={t.profile.interests} actionLabel={t.profile.edit} />
          <InterestChips interests={['Bourses', 'Master', 'Europe', 'Informatique', 'Anglais']} />
        </View>

        <View className="mt-8 gap-3">
          <SectionLabel label={t.profile.settings} />
          <SettingsList rows={settings} />
        </View>
      </ScrollView>

      <SettingSelectSheet<Locale>
        ref={languageSheet}
        title={t.profile.language}
        selected={locale}
        onSelect={setLocale}
        options={[
          { value: 'fr', label: t.profile.french },
          { value: 'en', label: t.profile.english },
        ]}
      />
      <SettingSelectSheet<ThemePref>
        ref={appearanceSheet}
        title={t.profile.appearance}
        selected={theme}
        onSelect={setTheme}
        options={[
          { value: 'light', label: t.profile.themeLight },
          { value: 'dark', label: t.profile.themeDark },
          { value: 'system', label: t.profile.themeSystem },
        ]}
      />
    </SafeAreaView>
  );
}
