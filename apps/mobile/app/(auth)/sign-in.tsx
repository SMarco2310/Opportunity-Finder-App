import { useSignIn, useSignUp } from '@clerk/clerk-expo';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
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

import { authConfigured } from '@/lib/auth/Providers';

// Phone-OTP auth (Clerk). Two phases: enter a +228 number, then the SMS code.
// Handles both new users (signUp) and returning users (signIn) transparently.
// Country is restricted to Togo (+228) in the Clerk dashboard.
type Phase = 'phone' | 'code';
type Mode = 'signup' | 'signin';

export default function SignInScreen() {
  const router = useRouter();
  const { isLoaded: signUpLoaded, signUp, setActive: setActiveSignUp } = useSignUp();
  const { isLoaded: signInLoaded, signIn, setActive: setActiveSignIn } = useSignIn();

  const [phase, setPhase] = useState<Phase>('phone');
  const [mode, setMode] = useState<Mode>('signup');
  const [phone, setPhone] = useState('+228 ');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const e164 = () => '+228' + phone.replace(/\D/g, '').replace(/^228/, '');

  async function sendCode() {
    if (!signUpLoaded || !signInLoaded) return;
    setBusy(true);
    setError(null);
    try {
      // Try to register the number first.
      await signUp.create({ phoneNumber: e164() });
      await signUp.preparePhoneNumberVerification({ strategy: 'phone_code' });
      setMode('signup');
      setPhase('code');
    } catch {
      // Number already exists → sign in instead.
      try {
        const attempt = await signIn.create({ identifier: e164() });
        const factor = attempt.supportedFirstFactors?.find(
          (f) => f.strategy === 'phone_code',
        );
        if (factor && 'phoneNumberId' in factor) {
          await signIn.prepareFirstFactor({
            strategy: 'phone_code',
            phoneNumberId: factor.phoneNumberId,
          });
          setMode('signin');
          setPhase('code');
        } else {
          setError('Numéro non pris en charge.');
        }
      } catch {
        setError('Impossible d’envoyer le code. Vérifie le numéro.');
      }
    } finally {
      setBusy(false);
    }
  }

  async function verifyCode() {
    setBusy(true);
    setError(null);
    try {
      if (mode === 'signup' && signUpLoaded) {
        const res = await signUp.attemptPhoneNumberVerification({ code });
        if (res.status === 'complete') {
          await setActiveSignUp({ session: res.createdSessionId });
          router.back();
          return;
        }
      } else if (signInLoaded) {
        const res = await signIn.attemptFirstFactor({ strategy: 'phone_code', code });
        if (res.status === 'complete') {
          await setActiveSignIn({ session: res.createdSessionId });
          router.back();
          return;
        }
      }
      setError('Code incorrect.');
    } catch {
      setError('Code incorrect ou expiré.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-paper">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1">
        <View className="flex-row justify-end px-5 pt-2">
          <Pressable onPress={() => router.back()} hitSlop={10} className="p-2 active:opacity-60">
            <Ionicons name="close" size={26} color="#1B1714" />
          </Pressable>
        </View>

        <View className="flex-1 px-6 pt-6">
          <Text className="text-4xl leading-tight text-ink">
            <Text className="font-serif-bold">Bienvenue</Text>
          </Text>
          <Text className="mt-2 font-sans text-base text-ink-muted">
            {phase === 'phone'
              ? 'Entre ton numéro pour recevoir un code par SMS.'
              : `Code envoyé au ${e164()}.`}
          </Text>

          {!authConfigured ? (
            <Text className="mt-6 font-sans text-sm text-urgency-red">
              Authentification non configurée. Lance `npx convex dev` et ajoute la clé Clerk.
            </Text>
          ) : phase === 'phone' ? (
            <View className="mt-8 gap-4">
              <TextInput
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                autoFocus
                placeholder="+228 90 00 00 00"
                placeholderTextColor="#B6ADA0"
                className="rounded-card border border-line bg-paper-card px-4 py-4 font-sans text-lg text-ink"
              />
              <PrimaryButton label="Recevoir le code" onPress={sendCode} busy={busy} />
            </View>
          ) : (
            <View className="mt-8 gap-4">
              <TextInput
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                autoFocus
                maxLength={6}
                placeholder="• • • • • •"
                placeholderTextColor="#B6ADA0"
                className="rounded-card border border-line bg-paper-card px-4 py-4 text-center font-serif text-2xl tracking-[8px] text-ink"
              />
              <PrimaryButton label="Confirmer" onPress={verifyCode} busy={busy} />
              <Pressable onPress={() => setPhase('phone')} className="self-center active:opacity-60">
                <Text className="font-sans-medium text-sm text-ink-muted">Changer de numéro</Text>
              </Pressable>
            </View>
          )}

          {error ? (
            <Text className="mt-4 font-sans text-sm text-urgency-red">{error}</Text>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function PrimaryButton({
  label,
  onPress,
  busy,
}: {
  label: string;
  onPress: () => void;
  busy: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={busy}
      className="flex-row items-center justify-center rounded-pill bg-primary py-4 active:opacity-90">
      {busy ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text className="font-sans-semibold text-base text-white">{label}</Text>
      )}
    </Pressable>
  );
}
