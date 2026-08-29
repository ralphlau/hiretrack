import type { HTMLAttributes } from "react";

/**
 * Loading placeholder. Set width/height via className per use
 * (e.g. `<Skeleton className="h-4 w-32" />`). Replaces the old ad-hoc
 * pulsing gray rectangles with a single consistent primitive.
 */
export function Skeleton({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`animate-pulse rounded-md bg-surface-sunken ${className}`} {...props} />;
}
