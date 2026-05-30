/** @type {import('tailwindcss').Config} */
module.exports = {
  // NativeWind v4 scans these files for className usage.
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      // -------------------------------------------------------------------
      // Editorial / literary palette — warm paper, near-black ink, olive
      // accent, soft pastel category badges. Mirrors the home-screen mock.
      // -------------------------------------------------------------------
      colors: {
        // Warm paper backgrounds
        paper: {
          DEFAULT: '#F6F1E9', // app background (warm cream)
          card: '#FFFFFF', // card surface
          sunk: '#EFE9DE', // recessed / pressed
        },
        // Warm ink (text)
        ink: {
          DEFAULT: '#1B1714', // near-black, warm
          muted: '#8B8175', // secondary text
          faint: '#B6ADA0', // tertiary / meta
        },
        line: {
          DEFAULT: '#E4DCCF', // hairline borders
          strong: '#D8CFBF',
        },
        // Brand green (buttons / primary actions — kept from plan)
        primary: {
          DEFAULT: '#0F6E56',
          dark: '#0B5743',
          light: '#E6F2EE',
        },
        // Editorial accent — olive leaf green (active tab, "2026", green deadlines)
        accent: {
          DEFAULT: '#6E8B3D',
          soft: '#A7B98A',
        },
        // Deadline urgency (the big serif numerals)
        urgency: {
          red: '#CF5B49', // < 7 days
          amber: '#C9952E', // < 30 days
          green: '#6E8B3D', // >= 30 days
        },
        // Category badges: { bg, fg } pastels
        cat: {
          scholarships: '#8A6D1F',
          'scholarships-bg': '#F3E7C8',
          jobs: '#3E6B2E',
          'jobs-bg': '#DEE8D2',
          fellowships: '#6B3FA0',
          'fellowships-bg': '#E8DEF5',
          grants: '#9C3D6E',
          'grants-bg': '#F4DCE9',
          contests: '#B5552A',
          'contests-bg': '#F6E0D0',
          training: '#1F6F7A',
          'training-bg': '#D5EAEC',
          events: '#9A7A1E',
          'events-bg': '#F1E8C9',
          volunteer: '#4F7A2E',
          'volunteer-bg': '#E0EBCF',
        },
        // Soft glow on the featured card
        glow: '#F7C9A8',
      },
      fontFamily: {
        // Display serif (Fraunces) — names, titles, deadline numerals
        serif: ['Fraunces_600SemiBold'],
        'serif-bold': ['Fraunces_700Bold'],
        'serif-black': ['Fraunces_900Black'],
        'serif-italic': ['Fraunces_600SemiBold_Italic'],
        'serif-italic-light': ['Fraunces_400Regular_Italic'],
        // Body / labels (Hanken Grotesk)
        sans: ['HankenGrotesk_400Regular'],
        'sans-medium': ['HankenGrotesk_500Medium'],
        'sans-semibold': ['HankenGrotesk_600SemiBold'],
        'sans-bold': ['HankenGrotesk_700Bold'],
      },
      borderRadius: {
        card: '24px',
        pill: '999px',
      },
    },
  },
  plugins: [],
};
