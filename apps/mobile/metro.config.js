// Metro bundles TypeScript/JS for Expo Go, emulators, and web during `pnpm start`.
// NativeWind hooks Tailwind classes from global.css into React Native styles.
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: './global.css' });
