import type { HTMLAttributes } from "react";

export type BadgeTone =
  | "neutral"
  | "accent"
  | "applied"
  | "interview"
  | "offer"
  | "rejected"
  | "success"
  | "danger";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  dot?: boolean;
}

const TONE_STYLES: Record<BadgeTone, { surface: string; text: string; dot: string }> = {
  neutral: { surface: "bg-surface-sunken", text: "text-ink-muted", dot: "bg-ink-faint" },
  accent: { surface: "bg-accent-soft", text: "text-accent-strong", dot: "bg-accent" },
  applied: { surface: "bg-applied-soft", text: "text-applied", dot: "bg-applied" },
  interview: { surface: "bg-interview-soft", text: "text-interview", dot: "bg-interview" },
  offer: { surface: "bg-offer-soft", text: "text-offer", dot: "bg-offer" },
  rejected: { surface: "bg-rejected-soft", text: "text-rejected", dot: "bg-rejected" },
  success: { surface: "bg-success-soft", text: "text-success", dot: "bg-success" },
  danger: { surface: "bg-danger-soft", text: "text-danger", dot: "bg-danger" },
};

/**
 * Generic status/label primitive. Deliberately a small rounded rectangle
 * (radius-sm) rather than a full pill — pill badges are the more
 * ubiquitous default; the tighter radius matches the rest of the system
 * and reads slightly more considered.
 *
 * Note: `StatusBadge.tsx` (stage/priority badges) is built on top of this
 * primitive via STAGE_TONE/PRIORITY_TONE in types/index.ts.
 */
export function Badge({ tone = "neutral", dot = false, className = "", children, ...props }: BadgeProps) {
  const styles = TONE_STYLES[tone];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-[13px] font-medium ${styles.surface} ${styles.text} ${className}`}
      {...props}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} />}
      {children}
    </span>
  );
}
