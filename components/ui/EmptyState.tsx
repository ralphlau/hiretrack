import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

/**
 * Empty-state primitive. The old "No applications yet" text-only state
 * was one of the clearest tells that the app felt unfinished — an empty
 * pipeline column or empty table is often the *first* thing a new user
 * (or a recruiter clicking around) sees, so it needs to explain what
 * belongs here and give a next action, not just announce absence.
 */
export function EmptyState({ icon: Icon, title, description, action, className = "" }: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-md border border-dashed border-border-strong bg-surface-sunken px-6 py-10 text-center ${className}`}
    >
      {Icon && (
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-surface text-ink-faint">
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </div>
      )}
      <p className="text-sm font-medium text-ink">{title}</p>
      {description && <p className="mt-1 max-w-xs text-[13px] text-ink-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
