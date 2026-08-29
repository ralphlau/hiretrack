import type { HTMLAttributes } from "react";

type CardPadding = "none" | "sm" | "md" | "lg";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: CardPadding;
}

const PADDING_STYLES: Record<CardPadding, string> = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

/**
 * Base surface primitive. Replaces the ad-hoc `border-white/10 bg-slate-900/70
 * backdrop-blur rounded-2xl` combination that was copy-pasted per screen —
 * one flat white surface, one hairline border, one shadow, one radius.
 */
export function Card({ padding = "md", className = "", ...props }: CardProps) {
  return (
    <div
      className={`rounded-lg border border-border bg-surface shadow-xs ${PADDING_STYLES[padding]} ${className}`}
      {...props}
    />
  );
}
