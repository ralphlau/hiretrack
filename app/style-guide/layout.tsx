import { Instrument_Sans } from "next/font/google";

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-display",
});

export default function StyleGuideLayout({ children }: { children: React.ReactNode }) {
  return <div className={instrumentSans.variable}>{children}</div>;
}
