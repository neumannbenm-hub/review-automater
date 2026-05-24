import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { getCurrentBranding } from "@/lib/tenant";
import { hexToRgbChannels, darkenHex } from "@/lib/supabase";
import "./globals.css";

export const metadata: Metadata = {
  title: "Review Automater — Get more 5-star reviews on autopilot",
  description:
    "Automated SMS and email follow-ups that turn your customers into reviewers.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const branding = await getCurrentBranding();

  // Compute RGB channel strings for Tailwind's opacity-aware CSS var pattern.
  // e.g. "79 70 229" → used as rgb(var(--brand-600) / 0.5) by Tailwind.
  const primary600 = hexToRgbChannels(branding.primary_color);
  const primary700 = darkenHex(branding.primary_color, 12);
  // Lighten primary by 15% for brand-500 approximation
  const primary500 = darkenHex(branding.secondary_color || branding.primary_color, -15);

  const brandingCss = `
    :root {
      --color-primary:   ${branding.primary_color};
      --color-secondary: ${branding.secondary_color};
      --font-family:     ${branding.font_family};
      --app-name:        "${branding.app_name}";
      --brand-600: ${primary600};
      --brand-700: ${primary700};
      --brand-500: ${primary500};
    }
  `.trim();

  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <style dangerouslySetInnerHTML={{ __html: brandingCss }} />
          {branding.favicon_url && (
            <link rel="icon" href={branding.favicon_url} />
          )}
        </head>
        <body className="bg-white text-gray-900 antialiased">{children}</body>
      </html>
    </ClerkProvider>
  );
}
