import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/AppShell";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "PedsIQ — Pediatrics Learning Engine",
  description: "A neuroscience-informed pediatrics learning engine for active recall, clinical reasoning, protocol fluency, examiner-trap correction, and exam-aware study.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased overflow-x-hidden`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
