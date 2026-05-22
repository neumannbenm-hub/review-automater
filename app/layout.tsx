import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Review Automater — Get more 5-star reviews on autopilot",
  description:
    "Automated SMS and email follow-ups that turn your customers into reviewers.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900 antialiased">{children}</body>
    </html>
  );
}
