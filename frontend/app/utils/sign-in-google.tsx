"use client";

import Button from "../components/button";
import { AuthHandler } from "@/lib/auth/auth";

export function GoogleSignIn() {
  const auth = new AuthHandler()
  return (
    <Button
      variant="secondary"
      onClick={() =>
        auth.signInWithOAuth({
          provider: "google",
          options: { redirectTo: `${process.env.NEXT_PUBLIC_REDIRECT_TO}` },
        })
      }
    >
      Continue with Google
    </Button>
  );
}
