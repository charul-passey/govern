import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

const HERO_HEADLINE =
  "Every company just hired a third workforce. Nobody’s managing its budget.";
const HERO_DESCRIPTION =
  "Govern is a working concept for chapter two: policy, budget instruments, and enforcement for intelligence.";

export const metadata: Metadata = {
  metadataBase: new URL("https://govern-charul-passeys-projects.vercel.app"),
  title: "Govern",
  description: HERO_DESCRIPTION,
  openGraph: {
    title: HERO_HEADLINE,
    description: HERO_DESCRIPTION,
    url: "/",
    siteName: "Govern",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: HERO_HEADLINE,
    description: HERO_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-ground font-sans text-ink">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
