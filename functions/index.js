const { setGlobalOptions } = require("firebase-functions");
const { onRequest } = require("firebase-functions/https");
const { createClient } = require("@supabase/supabase-js");

setGlobalOptions({ maxInstances: 5 });

const CRAWLERS =
  /facebookexternalhit|Twitterbot|LinkedInBot|WhatsApp|Slackbot/i;
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

let supabase = null;

const escape = (str) => {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\//g, "&#x2F;");
};

exports.sightingPreview = onRequest(
  { secrets: ["SUPABASE_ANON_KEY"] },
  async (req, res) => {
    const {
      WEBSITE_URL,
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
      APP_STORE_ID,
      PLAY_STORE_ID,
      APP_URL,
      APP_NAME,
    } = process.env;

    if (!WEBSITE_URL) {
      res.status(500).send("Server misconfigured: WEBSITE_URL");
      return;
    }

    const match = req.path.match(/(?:\/og)?\/sightings\/([\w-]+)/);
    const sightingId = match?.[1];
    const petId = req.query.petId;

    if (!sightingId || !UUID_REGEX.test(sightingId)) {
      res.status(400).send("Invalid sighting ID");
      return;
    }
    if (petId && !UUID_REGEX.test(petId)) {
      res.status(400).send("Invalid pet ID");
      return;
    }

    const userUrl = petId
      ? `${WEBSITE_URL}/sightings/${sightingId}?petId=${petId}`
      : `${WEBSITE_URL}/sightings/${sightingId}`;
    const ogUrl = petId
      ? `${WEBSITE_URL}/og/sightings/${sightingId}?petId=${petId}`
      : `${WEBSITE_URL}/og/sightings/${sightingId}`;

    const deepLink = `${APP_URL}/sightings/${sightingId}`;

    const ua = req.headers["user-agent"] || "";
    const isCrawler = CRAWLERS.test(ua);

    if (!isCrawler || !sightingId) {
      if (!sightingId) {
        res.redirect(`${WEBSITE_URL}/sightings`);
        return;
      }

      res.redirect(userUrl);
      return;
    }

    if (!supabase) {
      if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        res.status(500).send("Server misconfigured: SUPABASE URL or KEY");
        return;
      }
      supabase = createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY,
      );
    }

    // Fetch sighting from Supabase
    const { data, error } = await supabase
      .from("aggregated_sightings")
      .select("*")
      .eq("id", sightingId)
      .single();

    if (error || !data) {
      console.error("Supabase error: ", error);
      res.status(404).send("Sighting info not found");
      return;
    }

    const status = data.is_active ? "Active" : "Found";
    const title = escape(`SpotAPaw Lost Pet: ${data.name} - [${status}]`);
    const description = escape(
      `Help reunite this pet: ${data.gender} ${data.breed} ${data.species}. Features: ${data.features}`,
    );
    const image = escape(data.photo) || `${WEBSITE_URL}/default-og.png`;
    const safeAppName = escape(APP_NAME);
    const safeAppStoreId = escape(APP_STORE_ID);
    const safePlayStoreId = escape(PLAY_STORE_ID);

    res.status(200).set("Cache-Control", "public, max-age=3600")
      .send(`<!DOCTYPE html>
<html>
  <head>
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:image:alt" content="Photo of a lost pet" />
    <meta property="og:url" content="${ogUrl}" />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />

    <!-- iOS -->
    <meta property="al:ios:url" content="${deepLink}" />
    <meta property="al:ios:app_store_id" content="${safeAppStoreId}" />
    <meta property="al:ios:app_name" content="${safeAppName}" />

    <!-- Android -->
    <meta property="al:android:url" content="${deepLink}" />
    <meta property="al:android:package" content="${safePlayStoreId}" />
    <meta property="al:android:app_name" content="${safeAppName}" />

    <meta name="apple-itunes-app" content="app-id=${safeAppStoreId}, app-argument=${deepLink}" />
    <meta property="og:site_name" content="${safeAppName} - Lost Pet Finder" />
  </head>
  <body></body>
</html>`);
  },
);
