import type { Metadata, Viewport } from "next";
import RegisterServiceWorker from "@/components/RegisterServiceWorker";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AnalyticsScripts from "@/components/AnalyticsScripts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pass Goal — Premier League Fixtures, Results & Coverage",
  description: "Premier League fixtures, live results, and match-day articles.",
  manifest: "/manifest.json",
  // Paste the content value Google Search Console gives you for the
  // "HTML tag" verification method into NEXT_PUBLIC_GSC_VERIFICATION.
  verification: process.env.NEXT_PUBLIC_GSC_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION }
    : undefined,
};

export const viewport: Viewport = {
  themeColor: "#2D1B4E",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-chalk text-ink font-body antialiased flex flex-col min-h-screen" suppressHydrationWarning>
        <AnalyticsScripts />
        <RegisterServiceWorker />
        <Header />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
