import Ionicons from '@expo/vector-icons/Ionicons';
import { Text, View } from 'react-native';

// Shared heading block for onboarding steps: the locate glyph, a serif title
// with one italic olive-accent word, and a muted subtitle. An optional eyebrow
// label sits above the title (used by the interests step).
export function OnboardingHeader({
  eyebrow,
  titleLead,
  titleAccent,
  titleTail,
  subtitle,
}: {
  eyebrow?: string;
  titleLead: string;
  titleAccent: string;
  titleTail: string;
  subtitle: string;
}) {
  return (
    <View>
      <Ionicons name="locate" size={26} color="#6E8B3D" />
      {eyebrow ? (
        <Text className="mt-6 font-sans-medium text-base text-accent">{eyebrow}</Text>
      ) : null}
      <Text className={`${eyebrow ? 'mt-1' : 'mt-6'} text-4xl leading-tight text-ink`}>
        <Text className="font-serif-bold">{titleLead} </Text>
        <Text className="font-serif-italic text-accent">{titleAccent}</Text>
        <Text className="font-serif-bold">{titleTail}</Text>
      </Text>
      <Text className="mt-3 font-sans text-base leading-snug text-ink-muted">{subtitle}</Text>
    </View>
  );
}
