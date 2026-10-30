"use client";

import { Check } from "lucide-react";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { Button } from "./utils";

/* -------------------------------------------------------------------------- */
/* Base dialog: native <dialog>, so focus trap, Esc and backdrop come free    */
/* -------------------------------------------------------------------------- */

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children?: ReactNode;
  footer?: ReactNode;
  /** Set to false while an action is in flight to block Esc / backdrop close. */
  dismissible?: boolean;
};

export function Dialog({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  dismissible = true,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(e) => {
        // Esc key: let React state drive closing.
        e.preventDefault();
        if (dismissible) onClose();
      }}
      onClick={(e) => {
        // Clicks on the backdrop target the <dialog> element itself.
        if (dismissible && e.target === e.currentTarget) onClose();
      }}
      className="m-auto w-[calc(100%-1.5rem)] max-w-md rounded-3xl border-0 bg-white p-0 text-neutral-900 shadow-xl backdrop:bg-black/40"
    >
      {open ? (
        <div className="flex flex-col gap-4 p-6">
          <header className="flex flex-col gap-1">
            <h2 id={titleId} className="text-lg font-semibold text-neutral-900">
              {title}
            </h2>
            {subtitle ? (
              <p className="text-sm text-neutral-600">{subtitle}</p>
            ) : null}
          </header>
          {children}
          {footer ? <div className="flex gap-3 pt-2">{footer}</div> : null}
        </div>
      ) : null}
    </dialog>
  );
}

/* -------------------------------------------------------------------------- */
/* Choice dialog: pick one option from a list (language, radius, ...)         */
/* -------------------------------------------------------------------------- */

export type ChoiceOption<T extends string | number> = {
  value: T;
  label: string;
};

type ChoiceDialogProps<T extends string | number> = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  options: ChoiceOption<T>[];
  value: T;
  onSelect: (value: T) => void;
};

export function ChoiceDialog<T extends string | number>({
  open,
  onClose,
  title,
  subtitle,
  options,
  value,
  onSelect,
}: ChoiceDialogProps<T>) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      footer={
        <Button variant="secondary" className="flex-1" onClick={onClose}>
          Cancel
        </Button>
      }
    >
      <div
        role="radiogroup"
        aria-label={title}
        className="flex max-h-[50vh] flex-col gap-2 overflow-y-auto"
      >
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <button
              key={String(option.value)}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => {
                onSelect(option.value);
                onClose();
              }}
              className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6750A4] ${
                selected
                  ? "border-[#6750A4] bg-[#F3EDF7] font-medium text-[#6750A4]"
                  : "border-neutral-200 text-neutral-900 hover:bg-neutral-50"
              }`}
            >
              {option.label}
              {selected ? <Check className="size-4" aria-hidden /> : null}
            </button>
          );
        })}
      </div>
    </Dialog>
  );
}
