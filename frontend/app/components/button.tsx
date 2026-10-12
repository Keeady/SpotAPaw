import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "outline";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  leftIcon?: ReactNode;
  loading?: boolean;
};

const VARIANTS: Record<Variant, string> = {
  primary: "bg-[#65539e] text-white hover:bg-[#54438a] border-2 border-transparent",
  secondary: "bg-white text-[#65539e] border-2 border-[#65539e] hover:bg-[#65539e]/10",
  outline: "bg-white text-neutral-800 border border-neutral-300 hover:bg-neutral-50",
};

export default function Button({
  variant = "primary",
  leftIcon,
  loading = false,
  disabled,
  className = "",
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={[
        "flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-base font-semibold transition-colors",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#65539e]",
        "disabled:cursor-not-allowed disabled:opacity-60",
        VARIANTS[variant],
        className,
      ].join(" ")}
      {...props}
    >
      {leftIcon}
      {loading ? "Please wait…" : children}
    </button>
  );
}