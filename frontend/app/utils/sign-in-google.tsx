"use client";

import { createClient } from "@/lib/auth/supabase/client";
import Button from "../components/button";

export function GoogleSignIn() {
  const supabase = createClient();
  return (
    <Button
      variant="secondary"
      onClick={() =>
        supabase.auth.signInWithOAuth({
          provider: "google",
          options: { redirectTo: `${process.env.NEXT_PUBLIC_REDIRECT_TO}` },
        })
      }
    >
      Continue with Google
    </Button>
  );
}
