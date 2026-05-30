import { Text, View } from 'react-native';

import { URGENCY_TEXT, daysUntil, urgencyOf } from '@/lib/deadline';

// The signature element: days-until-deadline as a large Fraunces italic numeral
// with a small "J" (jours), colour-coded by urgency. Sits top-right on a card.
export function DeadlineNumeral({
  deadlineAt,
  size = 'md',
}: {
  deadlineAt: number;
  size?: 'sm' | 'md' | 'lg';
}) {
  const days = daysUntil(deadlineAt);
  const color = URGENCY_TEXT[urgencyOf(days)];
  const numberClass = size === 'lg' ? 'text-5xl' : size === 'sm' ? 'text-3xl' : 'text-4xl';

  return (
    <View className="flex-row items-start">
      <Text className={`font-serif-italic leading-none ${numberClass} ${color}`}>{days}</Text>
      <Text className="ml-0.5 mt-1 font-serif-italic-light text-sm text-ink-faint">J</Text>
    </View>
  );
}
