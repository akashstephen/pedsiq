import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/AppShell";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "PedsIQ — KUHS Pediatrics Exam Intelligence",
  description: "MCQ practice with 250+ clinically-validated questions, previous year question analysis, pattern insights, and structured answers for KUHS Pediatrics exams. Study the full syllabus — patterns describe the past, they do not predict the future.",
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
