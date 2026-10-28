"use client";

import { useState } from "react";
import Link from "next/link";
import TextField from "../../components/text-field";
import PasswordField from "../../components/password";
import Button from "../../components/button";
import Divider from "../../components/divider";
import SocialButtons from "../../components/social-buttons";
import { Mail } from "lucide-react";
import { isValidEmail } from "@/app/utils/email-validation";
import { AuthHandler } from "@/lib/auth/auth";
import { useRouter } from "next/navigation";

type Errors = { email?: string; password?: string };

type SignInFormProps = {
  onGoogle?: () => void;
  onApple?: () => void;
};

export default function SignInForm({ onGoogle, onApple }: SignInFormProps) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);

  const validate = (): Errors => {
    const e: Errors = {};
    if (!email || !isValidEmail(email)) {
      e.email = "Enter a valid email address.";
    }

    if (!password) e.password = "Enter your password.";
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
      await signInWithEmail();
    } finally {
      setLoading(false);
    }
  };

  async function signInWithEmail() {
    setLoading(true);
    const authHandler = new AuthHandler();
    authHandler
      .signInWithPassword(email, password)
      .then((session) => {
        if (session) {
          router.replace("/aggregated-sightings");
          return;
        }
      })
      .catch((error) => {
        console.error(error);
        setDisabled(false);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  return (
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

      <div>
        <PasswordField
          label="Password"
          name="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />
        <div className="mt-2 text-right">
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-[#65539e] underline-offset-4 hover:underline"
          >
            Forgot password?
          </Link>
        </div>
      </div>

      <Button type="submit" loading={loading} disabled={disabled}>
        Sign in
      </Button>

      <Divider />
      <SocialButtons onGoogle={onGoogle} onApple={onApple} />

      <p className="text-center text-sm text-neutral-700">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-semibold text-[#65539e] underline-offset-4 hover:underline"
        >
          Register
        </Link>
      </p>
    </form>
  );
}
