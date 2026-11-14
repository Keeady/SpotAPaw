import { createClient } from "@supabase/supabase-js";

// Keep in sync with the user-agent regex in next.config.js
export const CRAWLERS =
  /facebookexternalhit|Twitterbot|LinkedInBot|WhatsApp|Slackbot|Discordbot|TelegramBot/i;

export const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const escape = (str) => {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\//g, "&#x2F;");
};

let supabase = null;
export function getSupabase() {
  const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY } = process.env;
  if (!NEXT_PUBLIC_SUPABASE_URL || !NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) return null;
  if (!supabase) supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
  return supabase;
}

export const html = (body, status = 200) =>
  new Response(body, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });

export const text = (body, status) => new Response(body, { status });

// Builds the <meta> tags. Pass RAW values; everything is escaped here.
export function renderHead({ title, description, image, ogUrl, deepLink }) {
  const { APP_STORE_ID, PLAY_STORE_ID, APP_NAME } = process.env;
  const appName = escape(APP_NAME);
  const appStoreId = escape(APP_STORE_ID);
  const playStoreId = escape(PLAY_STORE_ID);
  const link = escape(deepLink);

  return `
    <meta charset="utf-8" />
    <meta property="og:title" content="${escape(title)}" />
    <meta property="og:description" content="${escape(description)}" />
    <meta property="og:image" content="${escape(image)}" />
    <meta property="og:image:alt" content="Photo of a lost pet" />
    <meta property="og:url" content="${escape(ogUrl)}" />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />

    <!-- iOS -->
    <meta property="al:ios:url" content="${link}" />
    <meta property="al:ios:app_store_id" content="${appStoreId}" />
    <meta property="al:ios:app_name" content="${appName}" />

    <!-- Android -->
    <meta property="al:android:url" content="${link}" />
    <meta property="al:android:package" content="${playStoreId}" />
    <meta property="al:android:app_name" content="${appName}" />

    <meta name="apple-itunes-app" content="app-id=${appStoreId}, app-argument=${link}" />
    <meta property="og:site_name" content="${appName} - Lost Pet Finder" />`;
}
