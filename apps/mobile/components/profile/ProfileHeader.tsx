import { LinearGradient } from 'expo-linear-gradient';
import { Text, View } from 'react-native';

import { initials } from '@/lib/text';

// Centered identity block: a gradient avatar (olive → gold) ringed by a dashed
// border, the serif name (first bold, last italic), location·age, and a bio.
export function ProfileHeader({
  fullName,
  location,
  age,
  bio,
}: {
  fullName: string;
  location?: string;
  age?: number;
  bio?: string;
}) {
  const [first, ...rest] = fullName.split(' ');
  const last = rest.join(' ');
  const meta = [location, age ? `${age} ans` : null].filter(Boolean).join(' · ');

  return (
    <View className="items-center">
      {/* Dashed ring */}
      <View className="rounded-full border border-dashed border-line-strong p-1.5">
        <LinearGradient
          colors={['#7C9A3E', '#D9A521']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ width: 104, height: 104, borderRadius: 52, alignItems: 'center', justifyContent: 'center' }}>
          <Text className="font-serif-bold text-3xl text-white">{initials(fullName)}</Text>
        </LinearGradient>
      </View>

      <Text className="mt-4 text-3xl text-ink">
        <Text className="font-serif-bold">{first}</Text>
        {last ? <Text className="font-serif-italic"> {last}</Text> : null}
      </Text>

      {meta ? <Text className="mt-1 font-sans text-base text-ink-muted">{meta}</Text> : null}
      {bio ? (
        <Text className="mt-3 px-6 text-center font-sans text-base leading-snug text-ink">
          {bio}
        </Text>
      ) : null}
    </View>
  );
}
