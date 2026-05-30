import { Text, View } from 'react-native';

// Three-column stat card with serif-italic numerals and hairline dividers.
function Stat({ value, label }: { value: number; label: string }) {
  return (
    <View className="flex-1 items-center">
      <Text className="font-serif-italic text-3xl text-ink">{value}</Text>
      <Text className="mt-1 font-sans-medium text-[11px] tracking-[1.5px] text-ink-muted">
        {label.toUpperCase()}
      </Text>
    </View>
  );
}

export function StatsCard({
  applications,
  accepted,
  saved,
  labels,
}: {
  applications: number;
  accepted: number;
  saved: number;
  labels: { applications: string; accepted: string; saved: string };
}) {
  return (
    <View className="flex-row rounded-card border border-line bg-paper-card py-5">
      <Stat value={applications} label={labels.applications} />
      <View className="w-px bg-line" />
      <Stat value={accepted} label={labels.accepted} />
      <View className="w-px bg-line" />
      <Stat value={saved} label={labels.saved} />
    </View>
  );
}
