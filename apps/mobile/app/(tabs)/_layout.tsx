import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';

import { FloatingTabBar } from '@/components/navigation/FloatingTabBar';
import { useT } from '@/lib/i18n';

const ACTIVE = '#6E8B3D';
const INACTIVE = '#A89F92';

type IconProps = { color: ColorValue; size: number; focused: boolean };

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
  const t = useT();
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ACTIVE,
        tabBarInactiveTintColor: INACTIVE,
      }}>
      <Tabs.Screen
        name="index"
        options={{ title: t.tabs.home, tabBarIcon: tabIcon('home', 'home-outline') }}
      />
      <Tabs.Screen
        name="explore"
        options={{ title: t.tabs.explore, tabBarIcon: tabIcon('search', 'search-outline') }}
      />
      <Tabs.Screen
        name="saved"
        options={{ title: t.tabs.saved, tabBarIcon: tabIcon('bookmark', 'bookmark-outline') }}
      />
      <Tabs.Screen
        name="alerts"
        options={{ title: t.tabs.alerts, tabBarIcon: tabIcon('notifications', 'notifications-outline') }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: t.tabs.profile, tabBarIcon: tabIcon('person', 'person-outline') }}
      />
    </Tabs>
  );
}
