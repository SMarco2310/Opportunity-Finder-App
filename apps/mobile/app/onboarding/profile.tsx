import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OnboardingBackground } from '@/components/onboarding/OnboardingBackground';
import { OnboardingHeader } from '@/components/onboarding/OnboardingHeader';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import { useDraft } from '@/lib/onboarding/draft';
import { fr } from '@/lib/i18n/fr';

const t = fr.onboarding.identity;

// Step 2/3 — name + age. Stored in the onboarding draft and submitted at the end
// of the flow. Age is optional; only the name is required to continue.
export default function ProfileScreen() {
  const router = useRouter();
  const { draft, setName, setAge } = useDraft();

  const canContinue = draft.fullName.trim().length > 0;

  return (
    <View className="flex-1 bg-paper">
      <OnboardingBackground />
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <OnboardingProgress step={2} total={3} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex-1">
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerClassName="px-6 pt-6 pb-4"
            keyboardShouldPersistTaps="handled">
            <OnboardingHeader
              titleLead={t.titleLead}
              titleAccent={t.titleAccent}
              titleTail={t.titleTail}
              subtitle={t.subtitle}
            />

            <Text className="mt-8 font-sans-semibold text-xs tracking-[1.5px] text-ink-muted">
              {t.nameLabel.toUpperCase()}
            </Text>
            <TextInput
              value={draft.fullName}
              onChangeText={setName}
              autoCapitalize="words"
              autoComplete="name"
              placeholder={t.namePlaceholder}
              placeholderTextColor="#B6ADA0"
              className="mt-2 rounded-card border border-line bg-paper-card px-4 py-4 font-sans text-lg text-ink"
            />

            <Text className="mt-6 font-sans-semibold text-xs tracking-[1.5px] text-ink-muted">
              {t.ageLabel.toUpperCase()}
            </Text>
            <TextInput
              value={draft.age}
              onChangeText={(v) => setAge(v.replace(/[^0-9]/g, '').slice(0, 3))}
              keyboardType="number-pad"
              placeholder="—"
              placeholderTextColor="#B6ADA0"
              className="mt-2 rounded-card border border-line bg-paper-card px-4 py-4 font-sans text-lg text-ink"
            />
            <Text className="mt-3 font-sans text-sm leading-snug text-ink-muted">{t.ageHint}</Text>
          </ScrollView>

          <View className="px-6 pb-2 pt-3">
            <Pressable
              onPress={() => router.push('/onboarding/interests')}
              disabled={!canContinue}
              className={`h-14 flex-row items-center justify-center rounded-pill active:opacity-90 ${
                canContinue ? 'bg-accent' : 'bg-accent/40'
              }`}>
              <Text className="font-sans-bold text-base text-white">{fr.onboarding.continue}</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 6 }} />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
