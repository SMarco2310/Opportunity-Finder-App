import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import { useWindowDimensions } from 'react-native';
import type { ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { fr } from '@/lib/i18n/fr';

// Editorial palette: olive accent for the active tab, warm grey when inactive.
const ACTIVE = '#6E8B3D';
const INACTIVE = '#A89F92';

// The bar aligns with the screen's content cards: same 20pt side gutter as the
// `px-5` page padding, centred. On tablets and wide web viewports we cap its
// width so it never stretches past a comfortable reading width.
const MAX_BAR_WIDTH = 560;
const CONTENT_GUTTER = 20;

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

  // Match the content gutter so the bar lines up with the cards; on wide
  // screens widen the gutter further to cap the bar at MAX_BAR_WIDTH, centred.
  const gutter = Math.max(CONTENT_GUTTER, (width - MAX_BAR_WIDTH) / 2);
  // Derive an explicit bar width and centre it. Setting `width` (not just
  // left/right) is required because the Android tab bar otherwise stays
  // full-width and only `left` shifts it, leaving the right edge glued.
  const barWidth = width - gutter * 2;
  const bottom = Math.max(insets.bottom, 16);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ACTIVE,
        tabBarInactiveTintColor: INACTIVE,
        tabBarLabelStyle: { fontFamily: 'HankenGrotesk_500Medium', fontSize: 11, marginTop: 2 },
        tabBarItemStyle: { paddingVertical: 6 },
        tabBarStyle: {
          position: 'absolute',
          // Use only `left` + `width` (no `right`/`alignSelf`). barWidth already
          // equals width - 2*gutter, so a left offset of `gutter` centres it.
          // Setting all four over-constrains the Android bar and shoves it off
          // to one side.
          left: gutter,
          width: barWidth,
          bottom,
          height: 68,
          borderRadius: 35,
          paddingTop: 4,
          // Pin paddingBottom so React Navigation stops auto-adding the bottom
          // safe-area inset inside the bar. The bar already floats clear of the
          // home indicator via `bottom`, so the injected inset only squashed and
          // clipped the icon+label — and did so differently on gesture- vs
          // button-nav Android. Symmetric padding keeps the fit identical on
          // every Android screen.
          paddingBottom: 4,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          borderWidth: 1,
          borderColor: '#E4DCCF',
          shadowColor: '#1B1714',
          shadowOpacity: 0.08,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 6 },
          elevation: 8,
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
