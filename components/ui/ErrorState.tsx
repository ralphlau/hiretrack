import { AlertTriangle } from "lucide-react";
import { Button } from "./Button";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

/**
 * Full-panel failure state — e.g. "couldn't load applications." Distinct
 * from `Banner`: this is for a whole section/page failing to load, not
 * a single form action failing (use Banner for that). The app currently
 * has no inline error surface anywhere — failures only ever show as a
 * toast — so a broken data fetch looks identical to an empty one.
 */
export function ErrorState({
  title = "Something went wrong",
  description,
  onRetry,
  retryLabel = "Try again",
  className = "",
}: ErrorStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-md border border-danger-soft bg-danger-soft px-6 py-10 text-center ${className}`}
    >
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-surface text-danger">
        <AlertTriangle className="h-5 w-5" strokeWidth={1.75} />
      </div>
      <p className="text-sm font-medium text-ink">{title}</p>
      {description && <p className="mt-1 max-w-xs text-[13px] text-ink-muted">{description}</p>}
      {onRetry && (
        <div className="mt-4">
          <Button variant="secondary" size="sm" onClick={onRetry}>
            {retryLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
