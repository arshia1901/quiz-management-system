/**
 * mobile/src/theme.ts
 * Design system — exact same colors as the web client (client/src/index.css)
 */

export const colors = {
  // Backgrounds
  bg1: "#0f0f13",      // darkest — page bg
  bg2: "#16161d",      // cards
  bg3: "#1e1e28",      // inputs, hover
  bg4: "#26263a",      // borders / dividers

  // Text
  text: "#e8e8f0",
  textMuted: "#8a8aaa",
  textFaint: "#55556a",

  // Accents
  accent: "#6c63ff",   // primary purple
  accentSoft: "rgba(108,99,255,0.15)",
  purple: "#a855f7",
  green: "#22d3a0",
  greenSoft: "rgba(34,211,160,0.15)",
  amber: "#f5a623",
  amberSoft: "rgba(245,166,35,0.15)",
  red: "#ff5c5c",
  redSoft: "rgba(255,92,92,0.15)",
  blue: "#4da6ff",
  blueSoft: "rgba(77,166,255,0.15)",

  // Gradients (use with expo-linear-gradient)
  gradientAccent: ["#6c63ff", "#a855f7"] as [string, string],
  gradientGreen: ["#22d3a0", "#4da6ff"] as [string, string],
  gradientCard: ["rgba(108,99,255,0.08)", "rgba(168,85,247,0.04)"] as [string, string],
};

export const typography = {
  xs: 11,
  sm: 12,
  base: 14,
  md: 15,
  lg: 17,
  xl: 20,
  "2xl": 24,
  "3xl": 30,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
};

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 9999,
};

export const shadows = {
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
};
