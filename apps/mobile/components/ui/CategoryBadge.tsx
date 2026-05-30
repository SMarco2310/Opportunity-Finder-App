import { Text, View } from 'react-native';

import { CATEGORY_META, type Category } from '@/lib/categories';

// Small pastel pill naming the opportunity's category (e.g. "Bourse").
export function CategoryBadge({ category }: { category: Category }) {
  const meta = CATEGORY_META[category];
  return (
    <View className={`self-start rounded-pill px-3 py-1 ${meta.badgeBg}`}>
      <Text className={`text-xs font-sans-semibold ${meta.badgeText}`}>{meta.badge}</Text>
    </View>
  );
}
