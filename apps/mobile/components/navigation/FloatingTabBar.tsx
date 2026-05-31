import type { BottomTabBarProps } from 'expo-router/build/react-navigation/bottom-tabs';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ACTIVE = '#6E8B3D';
const INACTIVE = '#A89F92';

const HORIZONTAL_GUTTER = 15;
const FLOAT_ABOVE_SAFE_AREA = 10;
const TAB_BAR_HEIGHT = 68;
const TAB_BAR_RADIUS = 25;
const MAX_BAR_WIDTH = 455;

/** Bottom scroll padding so lists clear the floating pill + safe area. */
export const TAB_BAR_SCROLL_PADDING = 128;

/**
 * Custom tab bar: React Navigation ignores tabBarStyle left/right on some iOS builds,
 * so we render the pill ourselves with explicit horizontal padding.
 */
export function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const wideLayout = width > MAX_BAR_WIDTH + HORIZONTAL_GUTTER * 2;
  const pillWidth = wideLayout ? MAX_BAR_WIDTH : width - HORIZONTAL_GUTTER * 2;
  const bottomInset = Math.max(insets.bottom, 16) + FLOAT_ABOVE_SAFE_AREA;

  return (
    <View
      style={[styles.host, { paddingBottom: bottomInset }]}
      pointerEvents="box-none">
      <View style={[styles.pill, { width: pillWidth, height: TAB_BAR_HEIGHT }]}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            typeof options.tabBarLabel === 'string'
              ? options.tabBarLabel
              : options.title ?? route.name;
          const focused = state.index === index;
          const color = focused ? ACTIVE : INACTIVE;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({ type: 'tabLongPress', target: route.key });
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tab}>
              {options.tabBarIcon?.({ focused, color, size: 22 })}
              <Text style={[styles.label, { color }]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingHorizontal: HORIZONTAL_GUTTER,
    backgroundColor: 'transparent',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: TAB_BAR_RADIUS,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4DCCF',
    paddingTop: 4,
    shadowColor: '#1B1714',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    gap: 2,
  },
  label: {
    fontFamily: 'HankenGrotesk_500Medium',
    fontSize: 11,
    marginTop: 2,
  },
});
