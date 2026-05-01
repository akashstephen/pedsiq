import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "PedsIQ — KUHS Pediatrics Exam Intelligence",
  description: "Previous Year Question analysis, predictions, and structured answers for KUHS Pediatrics exams",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <div className="flex min-h-screen bg-black">
          <Sidebar />
          <main className="flex-1 ml-0 md:ml-[280px] p-6 md:p-8 max-w-[1400px]">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
