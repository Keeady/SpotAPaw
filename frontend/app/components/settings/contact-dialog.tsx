"use client";

import { CircleCheck } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { Dialog } from "./dialog";
import { Button, fieldClass } from "./utils";

type ContactDialogProps = {
  open: boolean;
  onClose: () => void;
  onSend: (message: string) => Promise<void> | void;
};

export default function ContactDialog({
  open,
  onClose,
  onSend,
}: ContactDialogProps) {
  const fieldId = useId();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      setMessage("");
      setBusy(false);
      setSent(false);
      setError("");
    }
  }, [open]);

  const canSend = message.trim().length > 0 && !busy;

  const handleSend = async () => {
    if (!canSend) return;
    setBusy(true);
    setError("");
    try {
      await onSend(message.trim());
      setSent(true);
    } catch {
      setError("We couldn't send your message. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <Dialog
        open={open}
        onClose={onClose}
        title="Contact Us"
        footer={
          <Button className="flex-1" onClick={onClose}>
            Close
          </Button>
        }
      >
        <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-700">
          <CircleCheck className="size-5 shrink-0" aria-hidden />
          Thanks for reaching out! We&apos;ll get back to you soon.
        </div>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      dismissible={!busy}
      title="Contact Us"
      subtitle="Have a question, suggestion, or found a problem? We'd love to hear from you."
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
          <Button className="flex-1" onClick={handleSend} disabled={!canSend}>
            {busy ? "Sending…" : "Send"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-2">
        <label htmlFor={fieldId} className="sr-only">
          Message
        </label>
        <textarea
          id={fieldId}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write your message…"
          rows={5}
          maxLength={2000}
          disabled={busy}
          className={`${fieldClass} resize-none`}
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
