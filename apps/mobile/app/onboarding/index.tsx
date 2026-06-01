import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OnboardingBackground } from '@/components/onboarding/OnboardingBackground';
import { setIntroSeen } from '@/lib/onboarding/introFlag';
import { fr } from '@/lib/i18n/fr';

const t = fr.onboarding.intro;

// First-launch entry: an olive brand splash auto-fades (~1.4s) into the intro /
// value screen. Both CTAs mark the intro as seen and continue to the account
// step (Clerk handles new and returning users on the same screen).
export default function OnboardingIntro() {
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(true);
  const [splashOpacity] = useState(() => new Animated.Value(1));

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(splashOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => setShowSplash(false));
    }, 1400);
    return () => clearTimeout(timer);
  }, [splashOpacity]);

  const start = async () => {
    await setIntroSeen();
    router.push('/onboarding/account');
  };

  return (
    <View className="flex-1 bg-paper">
      <OnboardingBackground />
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <View className="flex-1 px-6">
          <IntroHero />

          <View className="mt-2 flex-row items-center gap-2.5">
            <View className="h-9 w-9 items-center justify-center rounded-xl bg-accent">
              <Ionicons name="locate" size={20} color="#F6F1E9" />
            </View>
            <Text className="font-sans-semibold text-lg text-ink">{t.brand}</Text>
          </View>

          <Text className="mt-5 text-4xl leading-tight text-ink">
            <Text className="font-serif-bold">{t.titleLead} </Text>
            <Text className="font-serif-italic text-accent">{t.titleAccent}</Text>
            <Text className="font-serif-bold">{t.titleTail}</Text>
          </Text>
          <Text className="mt-3 font-sans text-base leading-snug text-ink-muted">{t.subtitle}</Text>

          <View className="flex-1" />

          <Pressable
            onPress={start}
            className="h-14 flex-row items-center justify-center rounded-pill bg-accent active:opacity-90">
            <Text className="font-sans-bold text-base text-white">{t.cta}</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 6 }} />
          </Pressable>
          <Pressable onPress={start} hitSlop={8} className="mt-4 self-center active:opacity-60">
            <Text className="font-sans-medium text-base text-ink-muted">{t.haveAccount}</Text>
          </Pressable>
        </View>
      </SafeAreaView>

      {showSplash ? (
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            inset: 0,
            opacity: splashOpacity,
            backgroundColor: '#6E8B3D',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Ionicons name="locate" size={64} color="#F6F1E9" />
          <Text className="mt-6 text-center font-serif-bold text-4xl leading-tight text-paper">
            {'Opportunity\nFinder'}
          </Text>
        </Animated.View>
      ) : null}
    </View>
  );
}

// Three overlapping, slightly tilted opportunity cards — a lightweight echo of
// the mock's hero illustration, themed to the category badge palette.
function IntroHero() {
  return (
    <View className="mt-4 h-64 items-center justify-center">
      <HeroCard
        rotate="-6deg"
        translateY={-44}
        translateX={-18}
        badge="Fellowship"
        badgeBg="#E8DEF5"
        badgeText="#6B3FA0"
        title="Mandela Washington"
      />
      <HeroCard
        rotate="4deg"
        translateY={6}
        translateX={22}
        badge="Stage"
        badgeBg="#DEE8D2"
        badgeText="#3E6B2E"
        title="Business Analyst · Ecobank"
      />
      <HeroCard
        rotate="-1deg"
        translateY={62}
        translateX={0}
        badge="Bourse"
        badgeBg="#F3E7C8"
        badgeText="#8A6D1F"
        title="Bourse Eiffel Excellence 2026"
      />
    </View>
  );
}

function HeroCard({
  rotate,
  translateX,
  translateY,
  badge,
  badgeBg,
  badgeText,
  title,
}: {
  rotate: string;
  translateX: number;
  translateY: number;
  badge: string;
  badgeBg: string;
  badgeText: string;
  title: string;
}) {
  return (
    <View
      className="absolute w-72 rounded-card bg-paper-card p-4"
      style={{
        transform: [{ translateX }, { translateY }, { rotate }],
        shadowColor: '#1B1714',
        shadowOpacity: 0.1,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 8 },
        elevation: 6,
      }}>
      <View className="self-start rounded-pill px-2.5 py-1" style={{ backgroundColor: badgeBg }}>
        <Text className="font-sans-semibold text-xs" style={{ color: badgeText }}>
          {badge}
        </Text>
      </View>
      <Text className="mt-2 font-sans-bold text-base text-ink" numberOfLines={1}>
        {title}
      </Text>
    </View>
  );
}
