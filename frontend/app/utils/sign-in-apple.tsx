// components/AppleSignIn.tsx
"use client";

import { useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import Button from "../components/button";
import { AuthHandler } from "@/lib/auth/auth";

declare global {
  interface Window {
    AppleID?: any;
  }
}

async function generateNonce() {
  const nonce = btoa(
    String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))),
  );
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(nonce),
  );
  const hashedNonce = Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return { nonce, hashedNonce };
}

export default function AppleSignIn({
  label = "Continue with Apple",
}: {
  label?: string;
}) {
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const auth = new AuthHandler();

  const handleClick = async () => {
    if (!window.AppleID) return;
    setLoading(true);

    const { nonce, hashedNonce } = await generateNonce();

    window.AppleID.auth.init({
      clientId: process.env.NEXT_PUBLIC_APPLE_CLIENT_ID, // Services ID
      scope: "name email",
      redirectURI: process.env.NEXT_PUBLIC_REDIRECT_TO, // must be a registered Return URL/domain
      state: crypto.randomUUID(),
      nonce: hashedNonce, // hashed goes to Apple
      usePopup: true,
    });

    try {
      const res = await window.AppleID.auth.signIn();

      const { data, error } = await auth.signInWithIdToken({
        provider: "apple",
        token: res.authorization.id_token,
        nonce, // raw goes to Supabase
      });
      if (error) throw error;

      router.push("/aggregated-sightings");
      router.refresh();
    } catch (err: any) {
      if (err?.error !== "popup_closed_by_user") console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Script
        src="https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js"
        strategy="afterInteractive"
        onLoad={() => setReady(true)}
        onReady={() => setReady(true)}
      />
      <Button
        type="button"
        onClick={handleClick}
        disabled={!ready || loading}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          height: 44,
          padding: "0 20px",
          background: "#000",
          color: "#fff",
          border: "1px solid #000",
          borderRadius: 6,
          fontSize: 16,
          fontWeight: 500,
          opacity: ready && !loading ? 1 : 0.6,
          cursor: ready && !loading ? "pointer" : "default",
        }}
      >
        <svg
          width="16"
          height="20"
          viewBox="0 0 814 1000"
          fill="currentColor"
          aria-hidden
        >
          <path d="M788 340c-5 4-98 56-98 171 0 133 117 180 120 181-1 3-19 64-62 126-39 55-79 110-141 110s-78-36-150-36c-70 0-95 37-152 37s-97-51-144-116C46 790 0 663 0 543c0-195 127-298 252-298 66 0 121 44 163 44 40 0 102-46 177-46 29 0 131 3 196 100zM554 160c31-37 53-88 53-139 0-7-1-14-2-20-50 2-110 33-146 75-28 32-55 83-55 135 0 8 1 16 2 18 3 1 8 1 12 1 45 0 102-30 136-70z" />
        </svg>
        {label}
      </Button>
    </>
  );
}
