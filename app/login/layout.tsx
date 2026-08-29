import { Instrument_Sans } from "next/font/google";

// Display face — used only for the hero wordmark on this screen.
// Scoped here instead of the root layout since nothing else in the
// authenticated product uses it.
const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-display",
});

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <div className={instrumentSans.variable}>{children}</div>;
}
