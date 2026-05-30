/**
 * How to preview this app during development (Expo SDK 56).
 *
 * There is no in-editor “phone preview” pane — you run Metro with `pnpm start`
 * and open the bundle on a device, emulator, or (limited) web.
 *
 * Run from `apps/mobile` (or `pnpm start` at the repo root). Keep
 * `npx convex dev` running in a second terminal when using the real backend.
 *
 * @see https://docs.expo.dev/get-started/start-developing/
 */

/** Default: phone and PC on the same Wi‑Fi. Scan the QR code with Expo Go. */
export const PREVIEW_LAN = 'pnpm start' as const;

/**
 * Cross-network / restrictive Wi‑Fi (guest networks, corporate VLANs).
 * Requires `@expo/ngrok` in devDependencies (see package.json).
 * Slower reloads than LAN — prefer LAN or USB when possible.
 */
export const PREVIEW_TUNNEL = 'pnpm start:tunnel' as const;

/**
 * Android emulator on the same machine, or USB debugging with port reverse:
 * `adb reverse tcp:8081 tcp:8081` then open Expo Go / press `a` in the terminal.
 */
export const PREVIEW_LOCALHOST = 'pnpm start:localhost' as const;

/** Quick layout pass in the browser; not pixel-identical to Android native UI. */
export const PREVIEW_WEB = 'pnpm web' as const;

/**
 * Expo dev-server shortcuts (interactive terminal after `pnpm start`).
 * `a` — Android emulator/device · `w` — web · `r` — reload · `m` — dev menu
 */
export const EXPO_TERMINAL_SHORTCUTS = {
  android: 'a',
  web: 'w',
  reload: 'r',
  devMenu: 'm',
} as const;

/**
 * If `start:tunnel` fails with ngrok errors (`reading 'body'`, `remote gone away`):
 * 1. Ensure deps are installed: `pnpm install` (needs `@expo/ngrok` locally).
 * 2. Retry; ngrok occasionally rate-limits Expo’s shared tunnel pool.
 * 3. Fall back to `pnpm start` (LAN) or USB + `start:localhost` + adb reverse.
 */
export const TUNNEL_TROUBLESHOOTING = [
  'Run pnpm install so @expo/ngrok is linked in apps/mobile.',
  'Use pnpm start (LAN) when phone and laptop share Wi-Fi.',
  'Use pnpm start:localhost + adb reverse for USB-connected Android.',
  'Use pnpm web only for rough UI checks, not native behavior.',
] as const;
