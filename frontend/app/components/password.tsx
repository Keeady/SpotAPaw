"use client";

import { forwardRef, useState } from "react";
import TextField, { type TextFieldProps } from "../components/text-field";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";

type PasswordFieldProps = Omit<TextFieldProps, "type" | "leftIcon" | "rightSlot">;

const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  function PasswordField(props, ref) {
    const [visible, setVisible] = useState(false);

    return (
      <TextField
        ref={ref}
        {...props}
        type={visible ? "text" : "password"}
        leftIcon={<LockKeyhole />}
        rightSlot={
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Hide password" : "Show password"}
            aria-pressed={visible}
            className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 focus-visible:outline-2 focus-visible:outline-[#65539e]"
          >
            {/* open eye = password visible, closed eye = hidden */}
            {visible ? <Eye /> : <EyeOff />}
          </button>
        }
      />
    );
  }
);

export default PasswordField;