/** @type {import('tailwindcss').Config} */
module.exports = {
  // Dark mode toggled by the `.dark` class, driven by NativeWind's colorScheme
  // (see ThemeSync in app/_layout.tsx). Palette values live as CSS variables in
  // global.css so every token below flips automatically.
  darkMode: 'class',
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
        // Warm paper backgrounds (light/dark values in global.css)
        paper: {
          DEFAULT: 'rgb(var(--color-paper) / <alpha-value>)', // app background
          card: 'rgb(var(--color-paper-card) / <alpha-value>)', // card surface
          sunk: 'rgb(var(--color-paper-sunk) / <alpha-value>)', // recessed / pressed
        },
        // Warm ink (text)
        ink: {
          DEFAULT: 'rgb(var(--color-ink) / <alpha-value>)', // near-black, warm
          muted: 'rgb(var(--color-ink-muted) / <alpha-value>)', // secondary text
          faint: 'rgb(var(--color-ink-faint) / <alpha-value>)', // tertiary / meta
        },
        line: {
          DEFAULT: 'rgb(var(--color-line) / <alpha-value>)', // hairline borders
          strong: 'rgb(var(--color-line-strong) / <alpha-value>)',
        },
        // Brand green (buttons / primary actions — kept from plan)
        primary: {
          DEFAULT: 'rgb(var(--color-primary) / <alpha-value>)',
          dark: 'rgb(var(--color-primary-dark) / <alpha-value>)',
          light: 'rgb(var(--color-primary-light) / <alpha-value>)',
        },
        // Editorial accent — olive leaf green (active tab, "2026", green deadlines)
        accent: {
          DEFAULT: 'rgb(var(--color-accent) / <alpha-value>)',
          soft: 'rgb(var(--color-accent-soft) / <alpha-value>)',
        },
        // Deadline urgency (the big serif numerals)
        urgency: {
          red: 'rgb(var(--color-urgency-red) / <alpha-value>)', // < 7 days
          amber: 'rgb(var(--color-urgency-amber) / <alpha-value>)', // < 30 days
          green: 'rgb(var(--color-urgency-green) / <alpha-value>)', // >= 30 days
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
        glow: 'rgb(var(--color-glow) / <alpha-value>)',
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
