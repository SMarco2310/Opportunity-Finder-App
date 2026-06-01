import { useSSO, useSignIn, useSignUp } from '@clerk/clerk-expo';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthButton } from '@/components/onboarding/AuthButton';
import { OnboardingBackground } from '@/components/onboarding/OnboardingBackground';
import { OnboardingHeader } from '@/components/onboarding/OnboardingHeader';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import { authConfigured } from '@/lib/auth/Providers';
import { fr } from '@/lib/i18n/fr';

// Finalize any pending web-browser auth session (required for OAuth redirects).
WebBrowser.maybeCompleteAuthSession();

const t = fr.onboarding.account;
const NEXT = '/onboarding/profile';

// Step 1/3 — create account or sign in. Google/Apple via Clerk SSO, plus an
// email-code fallback. New and returning users use the same controls (Clerk
// signs in existing identities). On success the root gate / this screen advances
// to the profile step.
type Phase = 'form' | 'code';
type Mode = 'signup' | 'signin';

// Clerk hooks throw outside a ClerkProvider, which is absent in mock mode (no
// keys). Pick the variant before any hook runs so preview builds don't crash.
export default function AccountScreen() {
  return authConfigured ? <AccountReal /> : <AccountMock />;
}

function AccountReal() {
  const router = useRouter();
  const { startSSOFlow } = useSSO();
  const { isLoaded: suLoaded, signUp, setActive: setActiveSignUp } = useSignUp();
  const { isLoaded: siLoaded, signIn, setActive: setActiveSignIn } = useSignIn();

  const [phase, setPhase] = useState<Phase>('form');
  const [mode, setMode] = useState<Mode>('signup');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState<null | 'google' | 'apple' | 'email'>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authConfigured) return;
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);

  async function onSSO(strategy: 'oauth_google' | 'oauth_apple', which: 'google' | 'apple') {
    if (!authConfigured) return;
    setBusy(which);
    setError(null);
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy,
        redirectUrl: Linking.createURL('/onboarding/profile'),
      });
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        router.replace(NEXT);
      }
    } catch {
      setError(t.errorOAuth);
    } finally {
      setBusy(null);
    }
  }

  async function sendEmailCode() {
    if (!authConfigured || !suLoaded || !siLoaded) return;
    setBusy('email');
    setError(null);
    try {
      await signUp.create({ emailAddress: email });
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setMode('signup');
      setPhase('code');
    } catch {
      try {
        const attempt = await signIn.create({ identifier: email });
        const factor = attempt.supportedFirstFactors?.find((f) => f.strategy === 'email_code');
        if (factor && 'emailAddressId' in factor) {
          await signIn.prepareFirstFactor({
            strategy: 'email_code',
            emailAddressId: factor.emailAddressId,
          });
          setMode('signin');
          setPhase('code');
        } else {
          setError(t.errorEmail);
        }
      } catch {
        setError(t.errorEmail);
      }
    } finally {
      setBusy(null);
    }
  }

  async function verifyCode() {
    setBusy('email');
    setError(null);
    try {
      if (mode === 'signup' && suLoaded) {
        const res = await signUp.attemptEmailAddressVerification({ code });
        if (res.status === 'complete') {
          await setActiveSignUp({ session: res.createdSessionId });
          router.replace(NEXT);
          return;
        }
      } else if (siLoaded) {
        const res = await signIn.attemptFirstFactor({ strategy: 'email_code', code });
        if (res.status === 'complete') {
          await setActiveSignIn({ session: res.createdSessionId });
          router.replace(NEXT);
          return;
        }
      }
      setError(t.errorCode);
    } catch {
      setError(t.errorCode);
    } finally {
      setBusy(null);
    }
  }

  return (
    <View className="flex-1 bg-paper">
      <OnboardingBackground />
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <OnboardingProgress step={1} total={3} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex-1">
          <View className="flex-1 px-6 pt-6">
            {phase === 'form' ? (
              <>
                <OnboardingHeader
                  titleLead={t.titleLead}
                  titleAccent={t.titleAccent}
                  titleTail={t.titleTail}
                  subtitle={t.subtitle}
                />

                <View className="mt-8 gap-3">
                  <AuthButton
                    icon="logo-google"
                    iconColor="#DB4437"
                    label={t.google}
                    onPress={() => onSSO('oauth_google', 'google')}
                    busy={busy === 'google'}
                    disabled={!authConfigured}
                  />
                  <AuthButton
                    icon="logo-apple"
                    iconColor="#1B1714"
                    label={t.apple}
                    onPress={() => onSSO('oauth_apple', 'apple')}
                    busy={busy === 'apple'}
                    disabled={!authConfigured}
                  />
                </View>

                <View className="my-6 flex-row items-center gap-3">
                  <View className="h-px flex-1 bg-line" />
                  <Text className="font-sans text-sm text-ink-faint">{t.or}</Text>
                  <View className="h-px flex-1 bg-line" />
                </View>

                <Text className="font-sans-semibold text-xs tracking-[1.5px] text-ink-muted">
                  {t.emailLabel.toUpperCase()}
                </Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  editable={authConfigured}
                  placeholder={t.emailPlaceholder}
                  placeholderTextColor="#B6ADA0"
                  className="mt-2 rounded-card border border-line bg-paper-card px-4 py-4 font-sans text-lg text-ink"
                />
                <PrimaryButton
                  label={fr.onboarding.continue}
                  onPress={sendEmailCode}
                  busy={busy === 'email'}
                  disabled={!authConfigured || email.trim().length < 3}
                />

                {!authConfigured ? (
                  <Text className="mt-4 font-sans text-sm text-urgency-red">{t.notConfigured}</Text>
                ) : null}
                <Legal />
              </>
            ) : (
              <>
                <OnboardingHeader
                  titleLead={t.codeTitle}
                  titleAccent=""
                  titleTail=""
                  subtitle={t.codeSubtitle(email)}
                />
                <Text className="mt-8 font-sans-semibold text-xs tracking-[1.5px] text-ink-muted">
                  {t.codeLabel.toUpperCase()}
                </Text>
                <TextInput
                  value={code}
                  onChangeText={setCode}
                  keyboardType="number-pad"
                  autoFocus
                  maxLength={6}
                  placeholder={t.codePlaceholder}
                  placeholderTextColor="#B6ADA0"
                  className="mt-2 rounded-card border border-line bg-paper-card px-4 py-4 text-center font-serif text-2xl tracking-[8px] text-ink"
                />
                <PrimaryButton
                  label={fr.onboarding.continue}
                  onPress={verifyCode}
                  busy={busy === 'email'}
                  disabled={code.length < 6}
                />
                <Pressable
                  onPress={() => {
                    setPhase('form');
                    setCode('');
                  }}
                  className="mt-4 self-center active:opacity-60">
                  <Text className="font-sans-medium text-sm text-ink-muted">{t.changeEmail}</Text>
                </Pressable>
              </>
            )}

            {error ? (
              <Text className="mt-4 font-sans text-sm text-urgency-red">{error}</Text>
            ) : null}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

function PrimaryButton({
  label,
  onPress,
  busy,
  disabled,
}: {
  label: string;
  onPress: () => void;
  busy: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={busy || disabled}
      className={`mt-5 h-14 flex-row items-center justify-center rounded-pill active:opacity-90 ${
        disabled ? 'bg-accent/40' : 'bg-accent'
      }`}>
      {busy ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <>
          <Text className="font-sans-bold text-base text-white">{label}</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 6 }} />
        </>
      )}
    </Pressable>
  );
}

function Legal() {
  const l = fr.onboarding.legal;
  return (
    <Text className="mt-5 text-center font-sans text-sm leading-snug text-ink-faint">
      {l.pre}
      <Text className="underline">{l.terms}</Text>
      {l.mid}
      <Text className="underline">{l.privacy}</Text>
      {l.post}
    </Text>
  );
}

// Preview variant: no Clerk provider in mock mode, so render the same layout and
// let any control advance to the profile step so the flow stays walkable.
function AccountMock() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const next = () => router.push(NEXT);
  return (
    <View className="flex-1 bg-paper">
      <OnboardingBackground />
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <OnboardingProgress step={1} total={3} />
        <View className="flex-1 px-6 pt-6">
          <OnboardingHeader
            titleLead={t.titleLead}
            titleAccent={t.titleAccent}
            titleTail={t.titleTail}
            subtitle={t.subtitle}
          />
          <View className="mt-8 gap-3">
            <AuthButton icon="logo-google" iconColor="#DB4437" label={t.google} onPress={next} />
            <AuthButton icon="logo-apple" iconColor="#1B1714" label={t.apple} onPress={next} />
          </View>
          <View className="my-6 flex-row items-center gap-3">
            <View className="h-px flex-1 bg-line" />
            <Text className="font-sans text-sm text-ink-faint">{t.or}</Text>
            <View className="h-px flex-1 bg-line" />
          </View>
          <Text className="font-sans-semibold text-xs tracking-[1.5px] text-ink-muted">
            {t.emailLabel.toUpperCase()}
          </Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder={t.emailPlaceholder}
            placeholderTextColor="#B6ADA0"
            className="mt-2 rounded-card border border-line bg-paper-card px-4 py-4 font-sans text-lg text-ink"
          />
          <PrimaryButton label={fr.onboarding.continue} onPress={next} busy={false} />
          <Text className="mt-4 font-sans text-sm text-ink-faint">{t.notConfigured}</Text>
          <Legal />
        </View>
      </SafeAreaView>
    </View>
  );
}
