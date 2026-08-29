import type { BadgeTone } from "@/components/ui/Badge";

export type Stage = "Applied" | "Interview" | "Offer" | "Rejected";
export type WorkType = "Full-time" | "Part-time" | "Contract" | "Internship" | "Freelance";
export type Priority = "Low" | "Medium" | "High";
export type Role = "user" | "admin";

// Applied is intentionally neutral, not blue — see the note in globals.css.
// Only stages where something has actually happened carry a color.
export const STAGE_TONE: Record<Stage, BadgeTone> = {
  Applied: "applied",
  Interview: "interview",
  Offer: "offer",
  Rejected: "rejected",
};

export const STAGE_DOT: Record<Stage, string> = {
  Applied: "bg-applied",
  Interview: "bg-interview",
  Offer: "bg-offer",
  Rejected: "bg-rejected",
};

export const STAGE_TEXT: Record<Stage, string> = {
  Applied: "text-ink-muted",
  Interview: "text-interview",
  Offer: "text-offer",
  Rejected: "text-rejected",
};

// Single source of truth for chart fills (reports page) — kept in sync
// with the CSS color tokens in globals.css by hand, since Recharts needs
// real hex values rather than Tailwind classes.
export const STAGE_HEX: Record<Stage, string> = {
  Applied: "#6b6963",
  Interview: "#8c5f0c",
  Offer: "#2f6e52",
  Rejected: "#9b3b37",
};

export const PRIORITY_TONE: Record<Priority, BadgeTone> = {
  Low: "neutral",
  Medium: "accent",
  High: "danger",
};

export const WORK_TYPE_OPTIONS: WorkType[] = [
  "Full-time",
  "Part-time",
  "Contract",
  "Internship",
  "Freelance",
];
