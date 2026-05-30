import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Linking from 'expo-linking';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, ScrollView, Share, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DetailSection } from '@/components/detail/DetailSection';
import { CategoryBadge } from '@/components/ui/CategoryBadge';
import { CircleButton } from '@/components/ui/CircleButton';
import { DottedBackdrop } from '@/components/ui/DottedBackdrop';
import { daysUntil, formatShortDate, URGENCY_TEXT, urgencyOf } from '@/lib/deadline';
import { fr } from '@/lib/i18n/fr';
import { applyDomain, useOpportunity } from '@/lib/opportunityDetail';
import { initials, splitTrailingYear } from '@/lib/text';

export default function OpportunityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const opp = useOpportunity(id);
  const [saved, setSaved] = useState(false);

  if (!opp) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-paper">
        <Text className="font-sans text-ink-muted">{fr.common.loading}</Text>
      </SafeAreaView>
    );
  }

  const { head, year } = splitTrailingYear(opp.title);
  const days = daysUntil(opp.deadlineAt);
  const urgency = URGENCY_TEXT[urgencyOf(days)];

  // Cross-platform share: native sheet on device, Web Share / clipboard on web.
  const onShare = async () => {
    const message = fr.detail.shareText(opp.title, days, opp.applyUrl);
    try {
      if (Platform.OS === 'web') {
        const nav = globalThis.navigator as Navigator & { share?: (d: { text: string }) => Promise<void> };
        if (nav?.share) await nav.share({ text: message });
        else await nav?.clipboard?.writeText(message);
      } else {
        await Share.share({ message });
      }
    } catch {
      // User cancelled or share unavailable — no-op.
    }
  };

  const onApply = () => Linking.openURL(opp.applyUrl);

  return (
    <SafeAreaView className="flex-1 bg-paper" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-2">
        <CircleButton icon="arrow-back" onPress={() => router.back()} />
        <View className="flex-row gap-2.5">
          <CircleButton icon="share-outline" onPress={onShare} />
          {/* Save toggles locally for now; persisted via saves.add in Step 7. */}
          <CircleButton
            icon={saved ? 'bookmark' : 'bookmark-outline'}
            color={saved ? '#6E8B3D' : '#1B1714'}
            onPress={() => setSaved((s) => !s)}
          />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-40">
        {/* Hero */}
        <View className="mt-1 h-48 justify-end overflow-hidden rounded-card border border-line">
          <LinearGradient
            colors={['#F8DEC8', '#F1C09A']}
            start={{ x: 0.2, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ position: 'absolute', inset: 0 }}
          />
          <DottedBackdrop />
          <View className="flex-row items-center p-4">
            <View className="h-12 w-12 items-center justify-center rounded-2xl bg-paper-card">
              <Text className="font-sans-bold text-sm text-ink">{initials(opp.sourceName)}</Text>
            </View>
            <View className="ml-3">
              <Text className="font-sans-bold text-base text-ink">{opp.sourceName}</Text>
              <Text className="font-sans text-xs text-ink-muted">
                {[opp.sourceTagline, opp.sourceVerified ? fr.detail.verified : null]
                  .filter(Boolean)
                  .join(' · ')}
              </Text>
            </View>
          </View>
        </View>

        {/* Fact pills */}
        <View className="mt-5 flex-row flex-wrap items-center gap-2">
          <CategoryBadge category={opp.category} />
          {opp.factTags.map((tag) => (
            <View key={tag} className="rounded-pill border border-line px-3 py-1">
              <Text className="font-sans-medium text-xs text-ink-muted">{tag}</Text>
            </View>
          ))}
        </View>

        {/* Title */}
        <Text className="mt-4 font-serif-bold text-4xl leading-tight text-ink">
          {head}
          {year ? <Text className="font-serif-italic text-accent"> {year}</Text> : null}
        </Text>

        {/* Key-facts card */}
        <View className="mt-6 flex-row rounded-card border border-line bg-paper-card py-4">
          <View className="flex-1 items-center px-2">
            <Text className="font-sans-medium text-[10px] tracking-[1.5px] text-ink-muted">
              {fr.detail.deadline.toUpperCase()}
            </Text>
            <Text className="mt-1 font-serif-italic text-2xl text-ink">
              {formatShortDate(opp.deadlineAt)}
            </Text>
            <Text className={`mt-0.5 font-sans text-xs ${urgency}`}>{fr.detail.inDays(days)}</Text>
          </View>
          <View className="w-px bg-line" />
          <View className="flex-1 items-center px-2">
            <Text className="font-sans-medium text-[10px] tracking-[1.5px] text-ink-muted">
              {fr.detail.amount.toUpperCase()}
            </Text>
            <Text className="mt-1 text-center font-serif-italic text-2xl text-ink">
              {opp.amount ?? '—'}
              {opp.amountUnit ? (
                <Text className="font-sans text-xs text-ink-muted">{opp.amountUnit}</Text>
              ) : null}
            </Text>
            {opp.amountNote ? (
              <Text className="mt-0.5 font-sans text-xs text-ink-faint">{opp.amountNote}</Text>
            ) : null}
          </View>
          <View className="w-px bg-line" />
          <View className="flex-1 items-center px-2">
            <Text className="font-sans-medium text-[10px] tracking-[1.5px] text-ink-muted">
              {fr.detail.duration.toUpperCase()}
            </Text>
            <Text className="mt-1 font-serif-italic text-2xl text-ink">
              {opp.durationValue ?? '—'}
            </Text>
            {opp.durationUnit ? (
              <Text className="mt-0.5 font-sans text-xs text-ink-faint">{opp.durationUnit}</Text>
            ) : null}
          </View>
        </View>

        {/* Body */}
        <View className="mt-8 gap-7">
          <DetailSection title={fr.detail.about} body={opp.description} />

          <View className="gap-3">
            <Text className="font-sans-semibold text-xs tracking-[2px] text-ink-muted">
              {fr.detail.eligibleIf.toUpperCase()}
            </Text>
            {opp.eligibilityBullets.map((b) => (
              <View key={b} className="flex-row items-start">
                <Ionicons name="checkmark-circle" size={18} color="#6E8B3D" style={{ marginTop: 1 }} />
                <Text className="ml-2 flex-1 font-sans text-base leading-snug text-ink">{b}</Text>
              </View>
            ))}
          </View>

          <DetailSection title={fr.detail.whatItCovers} body={opp.coverage} />
          <DetailSection title={fr.detail.howToApply} body={opp.howToApply} />
        </View>
      </ScrollView>

      {/* Sticky action bar */}
      <View className="absolute inset-x-0 bottom-0 flex-row items-center justify-between border-t border-line bg-paper-card px-5 pb-8 pt-4">
        <View className="flex-1 pr-3">
          <Text className="font-sans-medium text-[10px] tracking-[1.5px] text-ink-faint">
            {fr.detail.applyOn.toUpperCase()}
          </Text>
          <Text numberOfLines={1} className="font-sans-bold text-base text-ink">
            {applyDomain(opp.applyUrl)}
          </Text>
        </View>
        <Pressable
          onPress={onApply}
          className="flex-row items-center justify-center rounded-pill bg-primary px-7 py-4 active:opacity-90">
          <Text className="font-sans-semibold text-base text-white">{fr.detail.apply}</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 6 }} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
