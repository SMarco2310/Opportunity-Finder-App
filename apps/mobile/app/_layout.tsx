import '../global.css';

import {
  Fraunces_400Regular_Italic,
  Fraunces_600SemiBold,
  Fraunces_600SemiBold_Italic,
  Fraunces_700Bold,
  Fraunces_900Black,
  useFonts as useFraunces,
} from '@expo-google-fonts/fraunces';
import {
  HankenGrotesk_400Regular,
  HankenGrotesk_500Medium,
  HankenGrotesk_600SemiBold,
  HankenGrotesk_700Bold,
} from '@expo-google-fonts/hanken-grotesk';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Providers } from '@/lib/auth/Providers';

// Dev preview: Metro must be running (`pnpm start` in apps/mobile). Open the app
// via Expo Go (QR), emulator (`a`), or browser (`w`). See lib/dev/preview.ts.

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

// Root shell: fonts → auth/realtime providers → tab stack + modal routes.
// Children render with mock data until EXPO_PUBLIC_* env vars are set (Providers).
export default function RootLayout() {
  const [loaded] = useFraunces({
    Fraunces_400Regular_Italic,
    Fraunces_600SemiBold,
    Fraunces_600SemiBold_Italic,
    Fraunces_700Bold,
    Fraunces_900Black,
    HankenGrotesk_400Regular,
    HankenGrotesk_500Medium,
    HankenGrotesk_600SemiBold,
    HankenGrotesk_700Bold,
  });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Providers>
          <BottomSheetModalProvider>
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#F6F1E9' } }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="opportunity/[id]" options={{ presentation: 'card' }} />
              <Stack.Screen name="(auth)/sign-in" options={{ presentation: 'modal' }} />
              <Stack.Screen name="onboarding/interests" options={{ presentation: 'card' }} />
            </Stack>
          </BottomSheetModalProvider>
        </Providers>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
