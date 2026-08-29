import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import type { HTMLAttributes } from "react";

type BannerTone = "danger" | "success" | "neutral";

interface BannerProps extends HTMLAttributes<HTMLDivElement> {
  tone?: BannerTone;
}

const TONE_STYLES: Record<BannerTone, { surface: string; icon: typeof AlertTriangle }> = {
  danger: { surface: "border-danger-soft bg-danger-soft text-danger", icon: AlertTriangle },
  success: { surface: "border-success-soft bg-success-soft text-success", icon: CheckCircle2 },
  neutral: { surface: "border-border bg-surface-sunken text-ink-muted", icon: Info },
};

/**
 * Compact inline message strip — form-level or page-level, not a whole
 * failed panel (use ErrorState for that). E.g. "Invalid email or
 * password" under a login form.
 */
export function Banner({ tone = "neutral", className = "", children, ...props }: BannerProps) {
  const { surface, icon: Icon } = TONE_STYLES[tone];
  return (
    <div
      className={`flex items-start gap-2 rounded-md border px-3 py-2.5 text-[13px] ${surface} ${className}`}
      {...props}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} />
      <div>{children}</div>
    </div>
  );
}
