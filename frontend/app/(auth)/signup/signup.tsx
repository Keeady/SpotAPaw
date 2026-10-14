"use client";

import { useCallback, useState, type FormEvent } from "react";
import Link from "next/link";
import TextField from "../../components/text-field";
import PasswordField from "../../components/password";
import Button from "../../components/button";
import Divider from "../../components/divider";
import SocialButtons from "../../components/social-buttons";
import { Mail } from "lucide-react";
import { isValidEmail } from "@/app/utils/email-validation";
import { isValidPassword } from "@/app/utils/password-validation";

type Errors = { email?: string; password?: string; confirm?: string };

type SignUpFormProps = {
  onSubmit?: (values: {
    email: string;
    password: string;
  }) => Promise<void> | void;
  onGoogle?: () => void;
  onApple?: () => void;
};

const PASSWORD_HELP =
  "Password must be at least 8 characters long, include one uppercase letter, one lowercase letter, one number, and one special character.";

export default function SignUpForm({
  onSubmit,
  onGoogle,
  onApple,
}: SignUpFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);

  const validate = (): Errors => {
    const e: Errors = {};
    if (!email || !isValidEmail(email)) {
      e.email = "Enter a valid email address.";
    }
    if (!password || !isValidPassword(password)) {
      e.password = PASSWORD_HELP;
    }
    if (confirm !== password) e.confirm = "Passwords do not match.";
    return e;
  };

  const handleSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    setLoading(true);
    try {
      await onSubmit?.({ email, password });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full flex-col gap-5">
      <TextField
        label="Email"
        type="email"
        name="email"
        autoComplete="email"
        placeholder="you@example.com"
        leftIcon={<Mail />}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
      />

      <PasswordField
        label="Password"
        name="password"
        autoComplete="new-password"
        placeholder="Create a password"
        helperText={errors.password ? undefined : PASSWORD_HELP}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
      />

      <PasswordField
        label="Confirm Password"
        name="confirmPassword"
        autoComplete="new-password"
        placeholder="Re-enter your password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        error={errors.confirm}
      />

      <Button type="submit" loading={loading}>
        Create an account
      </Button>

      <Divider />
      <SocialButtons onGoogle={onGoogle} onApple={onApple} />

      <p className="text-center text-sm text-neutral-700">
        Already have an account?{" "}
        <Link
          href="/signin"
          className="font-semibold text-[#65539e] underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
