import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/AppShell";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "PedsIQ — Pediatrics Workspace",
  description: "PedsIQ is a pediatrics learning workspace for MCQs, topic maps, retrieval drills, structured answers, and exam preparation.",
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
