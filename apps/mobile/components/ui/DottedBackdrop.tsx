import { View } from 'react-native';

// A faint dot grid overlay (matches the detail hero texture). Rendered as a grid
// of tiny low-opacity dots; pointer-events disabled so it never blocks touches.
export function DottedBackdrop({
  rows = 7,
  cols = 13,
  color = '#B5754A',
}: {
  rows?: number;
  cols?: number;
  color?: string;
}) {
  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', inset: 0, padding: 18, justifyContent: 'space-between' }}>
      {Array.from({ length: rows }).map((_, r) => (
        <View key={r} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {Array.from({ length: cols }).map((__, c) => (
            <View
              key={c}
              style={{ width: 3, height: 3, borderRadius: 1.5, backgroundColor: color, opacity: 0.18 }}
            />
          ))}
        </View>
      ))}
    </View>
  );
}
