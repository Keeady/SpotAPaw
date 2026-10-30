"use client";

import { ChevronRight, ExternalLink, type LucideIcon } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

/* -------------------------------------------------------------------------- */
/* Icon tones: every settings item gets its own color                         */
/* -------------------------------------------------------------------------- */

const TONES = {
  blue: "bg-blue-100 text-blue-600",
  emerald: "bg-emerald-100 text-emerald-600",
  amber: "bg-amber-100 text-amber-600",
  violet: "bg-violet-100 text-violet-600",
  pink: "bg-pink-100 text-pink-600",
  cyan: "bg-cyan-100 text-cyan-600",
  indigo: "bg-indigo-100 text-indigo-600",
  orange: "bg-orange-100 text-orange-600",
  teal: "bg-teal-100 text-teal-600",
  sky: "bg-sky-100 text-sky-600",
  red: "bg-red-100 text-red-600",
} as const;

export type Tone = keyof typeof TONES;

/* -------------------------------------------------------------------------- */
/* Shared field styling (inputs, textareas)                                   */
/* -------------------------------------------------------------------------- */

export const fieldClass =
  "w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-[#6750A4] focus:ring-1 focus:ring-[#6750A4] disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-500";

/* -------------------------------------------------------------------------- */
/* Button                                                                     */
/* -------------------------------------------------------------------------- */

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md";
};

const VARIANTS = {
  primary:
    "bg-[#6750A4] text-white hover:bg-[#5a4590] focus-visible:outline-[#6750A4] disabled:bg-neutral-300 disabled:text-neutral-500",
  secondary:
    "border border-neutral-300 bg-white text-[#6750A4] hover:bg-[#F3EDF7] focus-visible:outline-[#6750A4] disabled:opacity-50",
  danger:
    "bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-600 disabled:bg-neutral-300 disabled:text-neutral-500",
} as const;

const SIZES = {
  sm: "px-4 py-1.5 text-sm",
  md: "px-5 py-2.5 text-sm",
} as const;

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed ${SIZES[size]} ${VARIANTS[variant]} ${className}`}
    />
  );
}

/* -------------------------------------------------------------------------- */
/* Toggle switch                                                              */
/* -------------------------------------------------------------------------- */

export function Toggle({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6750A4] disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? "bg-[#6750A4]" : "bg-neutral-300"
      }`}
    >
      <span
        className={`inline-block size-5 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Section + item                                                             */
/* -------------------------------------------------------------------------- */

export function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="px-2 text-xs font-semibold uppercase tracking-wide text-neutral-600">
        {title}
      </h2>
      <div className="divide-y divide-neutral-100 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        {children}
      </div>
    </section>
  );
}

type SettingsItemProps = {
  icon: LucideIcon;
  tone: Tone;
  title: string;
  description?: ReactNode;
  destructive?: boolean;
  /** Static row: anything on the right (button, toggle, status text). */
  trailing?: ReactNode;
  /** Clickable row (opens a dialog). Shows `value` and a chevron. */
  onClick?: () => void;
  value?: string;
  /** Link row (opens an external page in a new tab). */
  href?: string;
};

const rowBase = "flex w-full items-center gap-3 px-4 py-3";
const rowInteractive =
  "transition-colors hover:bg-neutral-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#6750A4]";

export function SettingsItem({
  icon: Icon,
  tone,
  title,
  description,
  destructive,
  trailing,
  onClick,
  value,
  href,
}: SettingsItemProps) {
  const body = (
    <>
      <span
        className={`flex size-10 shrink-0 items-center justify-center rounded-full ${TONES[tone]}`}
      >
        <Icon className="size-5" aria-hidden />
      </span>
      <span className="flex min-w-0 flex-1 flex-col text-left">
        <span
          className={`text-sm font-medium ${
            destructive ? "text-red-600" : "text-neutral-900"
          }`}
        >
          {title}
        </span>
        {description ? (
          <span className="text-xs text-neutral-600">{description}</span>
        ) : null}
      </span>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`${rowBase} ${rowInteractive}`}
      >
        {body}
        <ExternalLink
          className="size-4 shrink-0 text-neutral-400"
          aria-hidden
        />
      </a>
    );
  }

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${rowBase} ${rowInteractive}`}
      >
        {body}
        {value ? (
          <span className="shrink-0 text-sm text-neutral-600">{value}</span>
        ) : null}
        <ChevronRight
          className="size-5 shrink-0 text-neutral-400"
          aria-hidden
        />
      </button>
    );
  }

  return (
    <div className={rowBase}>
      {body}
      {trailing ? <div className="shrink-0">{trailing}</div> : null}
    </div>
  );
}
