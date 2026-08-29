import { Badge } from "./Badge";
import { PRIORITY_TONE, STAGE_TONE, type Priority, type Stage } from "@/types";

interface StatusBadgeProps {
  kind: "stage" | "priority";
  value: Stage | Priority;
}

/**
 * Thin wrapper mapping domain values (pipeline stage / priority) onto the
 * generic Badge primitive's tones. Same external API as before, so every
 * call site (`<StatusBadge kind="stage" value={...} />`) is unchanged.
 */
export function StatusBadge({ kind, value }: StatusBadgeProps) {
  if (kind === "stage") {
    const stage = value as Stage;
    return (
      <Badge tone={STAGE_TONE[stage]} dot>
        {stage}
      </Badge>
    );
  }

  const priority = value as Priority;
  return <Badge tone={PRIORITY_TONE[priority]}>{priority}</Badge>;
}
