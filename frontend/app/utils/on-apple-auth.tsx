'use client';

import { createClient } from "@/lib/auth/supabase/client";

export function AppleRedirectButton() {
  const supabase = createClient();
  return (
    <button
      onClick={() =>
        supabase.auth.signInWithOAuth({
          provider: 'apple',
          options: { redirectTo: `${location.origin}/callback` },
        })
      }
    >
      Continue with Apple
    </button>
  );
}