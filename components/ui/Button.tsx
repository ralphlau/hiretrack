import { forwardRef, type ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";
type ButtonSize = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-white hover:bg-accent-strong disabled:bg-ink-faint disabled:text-white/70",
  secondary:
    "bg-surface text-ink border border-border hover:bg-surface-sunken disabled:text-ink-faint disabled:bg-surface",
  ghost:
    "bg-transparent text-ink-muted hover:bg-surface-sunken hover:text-ink disabled:text-ink-faint",
  destructive:
    "bg-danger text-white hover:bg-danger-strong disabled:bg-ink-faint disabled:text-white/70",
};

const SIZE_STYLES: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-[13px] gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
};

/**
 * Base action primitive. Every button in the app should render through
 * this component rather than restyling `<button>` inline per screen —
 * that inconsistency (different radius/color per page) was one of the
 * main things making the app read as independently-styled pages.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft disabled:cursor-not-allowed ${VARIANT_STYLES[variant]} ${SIZE_STYLES[size]} ${className}`}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
