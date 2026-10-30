"use client";

import { TriangleAlert } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { Dialog } from "./dialog";
import { Button, fieldClass } from "./utils";

const CONFIRM_WORD = "DELETE";

type DeleteAccountDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
};

export default function DeleteAccountDialog({
  open,
  onClose,
  onConfirm,
}: DeleteAccountDialogProps) {
  const inputId = useId();
  const [step, setStep] = useState<"warn" | "confirm">("warn");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Start fresh every time the dialog is reopened.
  useEffect(() => {
    if (!open) {
      setStep("warn");
      setText("");
      setBusy(false);
      setError("");
    }
  }, [open]);

  const canDelete = text === CONFIRM_WORD && !busy;

  const handleDelete = async () => {
    if (!canDelete) return;
    setBusy(true);
    setError("");
    try {
      await onConfirm();
      onClose();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (step === "warn") {
    return (
      <Dialog
        open={open}
        onClose={onClose}
        title="Delete Account?"
        subtitle="This will permanently delete your account and all of your data. This action cannot be undone."
        footer={
          <>
            <Button variant="secondary" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={() => setStep("confirm")}
            >
              Continue
            </Button>
          </>
        }
      >
        <div className="flex items-center gap-3 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
          <TriangleAlert className="size-5 shrink-0" aria-hidden />
          Your pets, reports and sightings will be removed for good.
        </div>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      dismissible={!busy}
      title="Confirm deletion"
      footer={
        <>
          <Button
            variant="secondary"
            className="flex-1"
            onClick={onClose}
            disabled={busy}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            onClick={handleDelete}
            disabled={!canDelete}
          >
            {busy ? "Deleting…" : "Delete Account"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-2">
        <label htmlFor={inputId} className="text-sm text-neutral-700">
          Type <span className="font-semibold">{CONFIRM_WORD}</span> to
          permanently delete your account
        </label>
        <input
          id={inputId}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleDelete();
          }}
          placeholder={CONFIRM_WORD}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          disabled={busy}
          className={fieldClass}
        />
        {error ? (
          <p role="alert" className="text-xs text-red-600">
            {error}
          </p>
        ) : null}
      </div>
    </Dialog>
  );
}
