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
import { AuthHandler } from "@/lib/auth/auth";

type Errors = {
  email?: string;
  password?: string;
  confirm?: string;
  top?: string;
};

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
  const [info, setInfo] = useState<string>("");
  const [disabled, setDisabled] = useState(false);

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

  const handleSubmit = async (ev: React.SubmitEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    setLoading(true);
    setDisabled(true);
    try {
      await signUpWithEmail?.(email, password);
      setEmail("");
      setPassword("");
      setConfirm("");
    } finally {
      setLoading(false);
    }
  };

  async function signUpWithEmail(email: string, password: string) {
    setLoading(true);

    const authHandler = new AuthHandler();
    authHandler
      .signUp(email, password)
      .then((session) => {
        if (!session) {
          setInfo("Check your inbox for Email verification.");
        }
      })
      .catch((error) => {
        setErrors({ top: "An error ocurred. Please try again." });
        console.error(error);
        setDisabled(false);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  return (
    <div className="flex flex-col items-center bg-white font-sans text-neutral-900">
      <div className="flex flex-1 flex-col self-start self-stretch py-2 mb-4">
        {info && (
          <p className="text-m font-medium py-2 text-green-700 bg-green-50 ">
            {info}
          </p>
        )}
        {errors.top && (
          <p className="text-m font-medium py-2 text-red-700 bg-red-50">
            {errors.top}
          </p>
        )}
      </div>
      <div>
        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex w-full flex-col gap-5"
        >
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

          <Button type="submit" loading={loading} disabled={disabled}>
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
        </form>
      </div>
    </div>
  );
}
