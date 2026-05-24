import type { Config } from "tailwindcss";

// Brand colors are driven by CSS variables set by TenantBrandingVars in the
// root layout. The <alpha-value> placeholder lets Tailwind's opacity modifiers
// (e.g. bg-brand-600/50) work correctly alongside CSS variable colors.
// Default values (the fallbacks after the comma) match the original indigo palette
// so the app looks correct even when Supabase is not yet configured.

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "rgb(var(--brand-50,  238 242 255) / <alpha-value>)",
          100: "rgb(var(--brand-100, 224 231 255) / <alpha-value>)",
          500: "rgb(var(--brand-500,  99 102 241) / <alpha-value>)",
          600: "rgb(var(--brand-600,  79  70 229) / <alpha-value>)",
          700: "rgb(var(--brand-700,  67  56 202) / <alpha-value>)",
        },
      },
    },
  },
  plugins: [],
};

export default config;
