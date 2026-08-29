import { forwardRef, useId, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

/**
 * Base text input primitive. Consolidates the input styling that was
 * previously restyled inline on the login/register forms and modal
 * fields — one border color, one radius, one focus treatment everywhere.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className = "", ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-[13px] font-medium text-ink-muted">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full rounded-md border bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-faint transition-colors focus:outline-none focus:ring-2 focus:ring-accent-soft disabled:bg-surface-sunken disabled:text-ink-faint ${
            error ? "border-danger focus:border-danger" : "border-border focus:border-accent"
          } ${className}`}
          aria-invalid={Boolean(error)}
          {...props}
        />
        {error && <p className="mt-1.5 text-[13px] text-danger">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
