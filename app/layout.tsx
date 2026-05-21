import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "Review Automater — Get more 5-star reviews on autopilot",
  description:
    "Automated SMS and email follow-ups that turn your customers into reviewers.",
};

const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const content = (
    <html lang="en">
      <body className="bg-white text-gray-900 antialiased">{children}</body>
    </html>
  );
  return hasClerk ? <ClerkProvider>{content}</ClerkProvider> : content;
}
