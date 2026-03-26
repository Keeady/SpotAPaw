const { setGlobalOptions } = require("firebase-functions");
const { onRequest } = require("firebase-functions/https");
const { createClient } = require("@supabase/supabase-js");

setGlobalOptions({ maxInstances: 5 });

let supabase = null;

exports.sightingPreview = onRequest(
  { secrets: ["SUPABASE_ANON_KEY"] },
  async (req, res) => {
    const WEBSITE_URL = process.env.WEBSITE_URL;
    if (!WEBSITE_URL) {
      console.error("Missing website url");
      res.status(500).send("Server misconfigured: WEBSITE_URL");
      return;
    }

    const ua = req.headers["user-agent"] || "";
    const CRAWLERS =
      /facebookexternalhit|Twitterbot|LinkedInBot|WhatsApp|Slackbot/i;
    const isCrawler = CRAWLERS.test(ua);

    const match = req.path.match(/\/og\/sightings\/([\w-]+)/);
    const sightingId = match?.[1];
    const petId = req.query.petId;

    const ogUrl = petId
      ? `${WEBSITE_URL}/og/sightings/${sightingId}?petId=${petId}`
      : `${WEBSITE_URL}/og/sightings/${sightingId}`;

    const userMatch = req.path.match(/\/sightings\/([\w-]+)/);
    const userSightingId = userMatch?.[1];

    const userUrl = petId
      ? `${WEBSITE_URL}/sightings/${userSightingId}?petId=${petId}`
      : `${WEBSITE_URL}/sightings/${userSightingId}`;

    if (!isCrawler || !sightingId) {
      res.redirect(userUrl);
      return;
    }

    if (!supabase) {
      if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
        console.error("Missing Supabase env vars");
        res.status(500).send("Server misconfigured: SUPABASE URL or KEY");
        return;
      }
      supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY,
      );
    }

    const APP_STORE_ID = process.env.APP_STORE_ID;
    const PLAY_STORE_ID = process.env.PLAY_STORE_ID;
    const APP_URL = process.env.APP_URL;
    const APP_NAME = process.env.APP_NAME;

    // Fetch sighting from Supabase
    const { data, error } = await supabase
      .from("aggregated_sightings")
      .select("*")
      .eq("linked_sighting_id", sightingId)
      .single();

    if (error || !data) {
      console.error("Supabase error: ", error);
      res.status(404).send("Sighting info not found");
      return;
    }

    const status = data.is_active ? "Active" : "Found";
    const title = `Spotapaw Lost Pet: ${data.name} - [${status}]!`;
    const description = `Help reunite this pet: ${data.gender} ${data.breed} ${data.species}. Features: ${data.features}`;
    const image = data.photo;

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
    <meta property="al:ios:url" content="${APP_URL}/${sightingId}" />
    <meta property="al:ios:app_store_id" content="${APP_STORE_ID}" />
    <meta property="al:ios:app_name" content="${APP_NAME}" />

    <!-- Android -->
    <meta property="al:android:url" content="${APP_URL}/${sightingId}" />
    <meta property="al:android:package" content="${PLAY_STORE_ID}" />
    <meta property="al:android:app_name" content="${APP_NAME}" />
    <!-- Add to your OG meta section in the Cloud Function -->
    <meta name="apple-itunes-app" content="app-id=${APP_STORE_ID}, app-argument=${APP_URL}/${sightingId}" />
  </head>
  <body></body>
</html>`);
  },
);
