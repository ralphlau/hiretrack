import type { Metadata } from "next";
import { Inter_Tight, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

// Body/UI face — used for every heading, label, and body of text in the
// authenticated product. Instrument Sans (display face) is intentionally
// NOT loaded here — it's scoped to just the login screen's own layout,
// since that's its only usage, so the app doesn't ship an unused font.
const interTight = Inter_Tight({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

// Numeric face — stat totals, dates, counts. The one signature thread
// that ties every screen together without relying on decoration.
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "TALA",
  description: "Track your job applications",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${interTight.variable} ${plexMono.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}