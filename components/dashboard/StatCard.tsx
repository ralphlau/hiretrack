import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number | string;
  caption?: string;
  icon: LucideIcon;
}

/**
 * All stat cards share one icon-chip treatment (accent-soft) rather than a
 * different rainbow color per card — per-card color-coding is a common
 * "generic dashboard" tell; the number itself (in mono) does the work of
 * differentiating cards, not decoration.
 */
export function StatCard({ label, value, caption, icon: Icon }: StatCardProps) {
  return (
    <div className="rounded-lg border border-border bg-surface p-5 shadow-xs">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[13px] text-ink-muted">{label}</p>
          <p className="mt-2 font-mono text-stat font-semibold tabular-nums text-ink">{value}</p>
        </div>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent-soft text-accent-strong">
          <Icon className="h-4 w-4" strokeWidth={1.75} />
        </div>
      </div>
      {caption && <p className="mt-4 text-[13px] text-ink-faint">{caption}</p>}
    </div>
  );
}
