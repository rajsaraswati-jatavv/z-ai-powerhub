import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Z.ai PowerHub v3 — Ultimate AI Multi-Tool Platform",
  description: "Next-level AI platform: Chat, Image Gen, Vision AI, TTS, Web Search, Code Playground, and more. Built with Next.js 16 & Z.ai SDK.",
  keywords: ["Z.ai", "AI", "Chat", "Image Generation", "TTS", "Vision", "Search"],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} dark`}>
      <body className="min-h-screen bg-background text-foreground antialiased">{children}</body>
    </html>
  );
}
