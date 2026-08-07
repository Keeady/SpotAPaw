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
      supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
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
    const image =
      data.photos && data.photos.length > 0
        ? data.photos[0]
        : `${WEBSITE_URL}/default-og.png`;
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

exports.posterPreview = onRequest(
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

    const match = req.path.match(/(?:\/og)?\/posters\/([\w-]+)/);
    const posterId = match?.[1];

    if (!posterId) {
      res.status(400).send("Invalid poster ID");
      return;
    }

    const userUrl = `${WEBSITE_URL}/posters/${posterId}`;
    const ogUrl = `${WEBSITE_URL}/og/posters/${posterId}`;
    const deepLink = `${APP_URL}/posters/${posterId}`;

    const ua = req.headers["user-agent"] || "";
    const isCrawler = CRAWLERS.test(ua);

    if (!supabase) {
      if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        res.status(500).send("Server misconfigured: SUPABASE URL or KEY");
        return;
      }
      supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }

    // Fetch poster from Supabase
    const { data, error } = await supabase
      .from("posters")
      .select("*")
      .eq("id", posterId)
      .single();

    if (error || !data) {
      console.error("Supabase error: ", error);
      res.status(404).send("Poster info not found");
      return;
    }

    const title = escape(`SpotAPaw Lost Pet Poster`);
    const description = escape(`${data.headline} - ${data.subheadline}`);
    const image = data.photo_url;

    const safeAppName = escape(APP_NAME);
    const safeAppStoreId = escape(APP_STORE_ID);
    const safePlayStoreId = escape(PLAY_STORE_ID);

    const petName = escape(data.name) || "";
    const petBreed = escape(data.breed) || "";
    const petColor = escape(data.colors) || "";
    const lastSeenLocation = escape(data.last_seen_location) || "";
    const lastSeenTime = escape(data.last_seen_time) || "";
    const contactName = escape(data.contact_name) || "";
    const contactPhone = escape(data.contact_phone) || "";
    const cta = escape(data.cta) || "";
    const photoUrl = escape(data.photo_url) || "";
    const headline = escape(data.headline) || "";
    const subheadline = escape(data.subheadline) || "";
    const petDescription = escape(data.description) || "";
    const sightingId = escape(data.sighting_id) || "";

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
  <body style="box-sizing: border-box; margin: 0; padding: 0; font-family: Arial, sans-serif; width: 650px;">
  <div style="background: #0F6E56; color: #E1F5EE; text-align: center; padding: 24px;">
    <div style="font-size: 36px; font-weight: bold; letter-spacing: 3px;">${headline}</div>
    <div style="font-size: 14px; margin-top: 4px; opacity: 0.85;">${subheadline}</div>
  </div>
  <img style="width: 100%; height: auto; object-fit: contain; aspect-ratio: 1.5;" src="${photoUrl}" />
  <div style="padding: 20px 24px;">
    <div style="font-size: 28px; font-weight: bold; margin-bottom: 8px;">${petName}</div>
    <div style="font-size: 14px; line-height: 1.6; color: #444; margin-bottom: 16px;">${petDescription}</div>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px;">
      <div style="background: #f5f5f5; border-radius: 6px; padding: 10px 12px;">
        <div style="font-size: 10px; text-transform: uppercase; color: #888; letter-spacing: 0.5px;">Breed</div>
        <div style="font-size: 14px; font-weight: bold; color: #222; margin-top: 2px;">${petBreed}</div>
      </div>
      <div style="background: #f5f5f5; border-radius: 6px; padding: 10px 12px;">
        <div style="font-size: 10px; text-transform: uppercase; color: #888; letter-spacing: 0.5px;">Color</div>
        <div style="font-size: 14px; font-weight: bold; color: #222; margin-top: 2px;">${petColor}</div>
      </div>
      <div style="background: #f5f5f5; border-radius: 6px; padding: 10px 12px;">
        <div style="font-size: 10px; text-transform: uppercase; color: #888; letter-spacing: 0.5px;">Last seen location</div>
        <div style="font-size: 14px; font-weight: bold; color: #222; margin-top: 2px;">${lastSeenLocation}</div>
      </div>
      <div style="background: #f5f5f5; border-radius: 6px; padding: 10px 12px;">
        <div style="font-size: 10px; text-transform: uppercase; color: #888; letter-spacing: 0.5px;">Last seen time</div>
        <div style="font-size: 14px; font-weight: bold; color: #222; margin-top: 2px;">${lastSeenTime}</div>
      </div>
    </div>
    <div style="background: #FAEEDA; border: 1px solid #EF9F27; border-radius: 6px;
             padding: 12px; text-align: center; font-weight: bold; color: #854F0B;
             margin-bottom: 16px; font-size: 15px;">${cta}</div>
    <div style="border-top: 1px solid #eee; padding-top: 14px; text-align: center;">
      <div style="font-size: 13px; color: #555; margin: 4px 0;">${contactName} 📞 ${contactPhone}</div>
    </div>
  </div>
  <div style="background: #f5f5f5; text-align: center; font-size: 11px; color: #888; padding: 10px;">
   <a href="https://spotapaw.com/sightings/${sightingId}" style="color: #888; text-decoration: none;">spotapaw.com/sightings/${sightingId} · report a sighting</a>
  </div>
  </body>
</html>`);
  },
);
