import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import { useWindowDimensions, View } from 'react-native';
import type { ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { fr } from '@/lib/i18n/fr';

// Editorial palette: olive accent for the active tab, warm grey when inactive.
const ACTIVE = '#6E8B3D';
const INACTIVE = '#A89F92';

// Floating pill tab bar — horizontal inset + lift above home indicator (design mockup).
const HORIZONTAL_GUTTER = 20;
const FLOAT_ABOVE_SAFE_AREA = 10;
const TAB_BAR_HEIGHT = 68;
const TAB_BAR_RADIUS = 32;

// On tablets / wide web, cap width and centre; phones use HORIZONTAL_GUTTER on both sides.
const MAX_BAR_WIDTH = 450;

type IconProps = { color: ColorValue; size: number; focused: boolean };

// Tab icon that swaps to the filled glyph when the tab is active.
function tabIcon(
  active: keyof typeof Ionicons.glyphMap,
  inactive: keyof typeof Ionicons.glyphMap,
) {
  function TabBarIcon({ color, size, focused }: IconProps) {
    return <Ionicons name={focused ? active : inactive} color={color} size={size} />;
  }
  return TabBarIcon;
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const wideLayout = width > MAX_BAR_WIDTH + HORIZONTAL_GUTTER * 2;
  const gutter = wideLayout ? (width - MAX_BAR_WIDTH) / 2 : HORIZONTAL_GUTTER;
  const bottom = Math.max(insets.bottom, 16) + FLOAT_ABOVE_SAFE_AREA;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // Full-width default background would hide the “floating” gaps; keep it clear.
        tabBarBackground: () => <View style={{ flex: 1, backgroundColor: 'transparent' }} />,
        tabBarActiveTintColor: ACTIVE,
        tabBarInactiveTintColor: INACTIVE,
        tabBarLabelStyle: { fontFamily: 'HankenGrotesk_500Medium', fontSize: 11, marginTop: 2 },
        tabBarItemStyle: { paddingVertical: 6 },
        tabBarStyle: {
          position: 'absolute',
          left: gutter,
          right: gutter,
          bottom,
          height: TAB_BAR_HEIGHT,
          borderRadius: TAB_BAR_RADIUS,
          paddingTop: 4,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          borderWidth: 1,
          borderColor: '#E4DCCF',
          shadowColor: '#1B1714',
          shadowOpacity: 0.1,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: 8 },
          elevation: 12,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{ title: fr.tabs.home, tabBarIcon: tabIcon('home', 'home-outline') }}
      />
      <Tabs.Screen
        name="explore"
        options={{ title: fr.tabs.explore, tabBarIcon: tabIcon('search', 'search-outline') }}
      />
      <Tabs.Screen
        name="saved"
        options={{ title: fr.tabs.saved, tabBarIcon: tabIcon('bookmark', 'bookmark-outline') }}
      />
      <Tabs.Screen
        name="alerts"
        options={{ title: fr.tabs.alerts, tabBarIcon: tabIcon('notifications', 'notifications-outline') }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: fr.tabs.profile, tabBarIcon: tabIcon('person', 'person-outline') }}
      />
    </Tabs>
  );
}
