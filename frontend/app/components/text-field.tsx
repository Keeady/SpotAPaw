"use client";

import {
  forwardRef,
  JSX,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";

export type TextFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "id"
> & {
  label: string;
  /** MDI icon path (e.g. mdiEmailOutline) shown on the left */
  leftIcon?: JSX.Element;
  /** Anything rendered inside the input on the right (e.g. a toggle button) */
  rightSlot?: ReactNode;
  error?: string;
  helperText?: string;
};

const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField(
    { label, leftIcon, rightSlot, error, helperText, className = "", ...props },
    ref,
  ) {
    const id = useId();
    const helpId = `${id}-help`;
    const errorId = `${id}-error`;

    const describedBy =
      [error ? errorId : null, helperText ? helpId : null]
        .filter(Boolean)
        .join(" ") || undefined;

    return (
      <div className="w-full">
        <label
          htmlFor={id}
          className="mb-1.5 block text-sm font-medium text-neutral-800"
        >
          {label}
        </label>

        <div className="relative">
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
            {leftIcon}
          </div>

          <input
            ref={ref}
            id={id}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className={[
              "block w-full rounded-xl border bg-white py-3 text-base text-neutral-900 placeholder:text-neutral-400",
              "transition-colors focus:outline-none focus:ring-2",
              leftIcon ? "pl-10" : "pl-4",
              rightSlot ? "pr-12" : "pr-4",
              error
                ? "border-red-500 focus:border-red-500 focus:ring-red-500/30"
                : "border-neutral-300 focus:border-[#65539e] focus:ring-[#65539e]/30",
              className,
            ].join(" ")}
            {...props}
          />

          {rightSlot && (
            <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
              {rightSlot}
            </div>
          )}
        </div>

        {error && (
          <p id={errorId} role="alert" className="mt-1.5 text-sm text-red-600">
            {error}
          </p>
        )}
        {helperText && (
          <p id={helpId} className="mt-1.5 text-sm text-neutral-500">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

export default TextField;
