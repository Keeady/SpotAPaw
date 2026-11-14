import {
  UUID_REGEX,
  escape,
  getSupabase,
  html,
  renderHead,
  text,
} from "../../../../lib/og.js";

export async function GET(request, { params }) {
  const { WEBSITE_URL, APP_URL } = process.env;
  if (!WEBSITE_URL) return text("Server misconfigured: WEBSITE_URL", 500);

  const { id: posterId } = await params; // works on Next 14 and 15
  if (!posterId || !/^\d$/.test(posterId)) {
    return text("Invalid poster ID", 400);
  }

  const ogUrl = `${WEBSITE_URL}/og/posters/${posterId}`;
  const deepLink = `${APP_URL}/posters/${posterId}`;

  const supabase = getSupabase();
  if (!supabase) return text("Server misconfigured: SUPABASE URL or KEY", 500);

  const { data, error } = await supabase
    .from("posters")
    .select("*")
    .eq("id", posterId)
    .single();

  if (error || !data) {
    console.error("Supabase error: ", error);
    return text("Poster info not found", 404);
  }

  const head = renderHead({
    title: "SpotAPaw Lost Pet Poster",
    description: `${data.headline} - ${data.subheadline}`,
    image: data.photo_url,
    ogUrl,
    deepLink,
  });

  const e = {
    petName: escape(data.name),
    petBreed: escape(data.breed),
    petColor: escape(data.colors),
    lastSeenLocation: escape(data.last_seen_location),
    lastSeenTime: escape(data.last_seen_time),
    contactName: escape(data.contact_name),
    contactPhone: escape(data.contact_phone),
    cta: escape(data.cta),
    photoUrl: escape(data.photo_url),
    headline: escape(data.headline),
    subheadline: escape(data.subheadline),
    petDescription: escape(data.description),
    sightingId: escape(data.sighting_id),
  };

  return html(`<!DOCTYPE html>
<html>
  <head>${head}
  </head>
  <body style="box-sizing: border-box; margin: 0; padding: 0; font-family: Arial, sans-serif; width: 650px;">
  <div style="background: #0F6E56; color: #E1F5EE; text-align: center; padding: 24px;">
    <div style="font-size: 36px; font-weight: bold; letter-spacing: 3px;">${e.headline}</div>
    <div style="font-size: 14px; margin-top: 4px; opacity: 0.85;">${e.subheadline}</div>
  </div>
  <img style="width: 100%; height: auto; object-fit: contain; aspect-ratio: 1.5;" src="${e.photoUrl}" />
  <div style="padding: 20px 24px;">
    <div style="font-size: 28px; font-weight: bold; margin-bottom: 8px;">${e.petName}</div>
    <div style="font-size: 14px; line-height: 1.6; color: #444; margin-bottom: 16px;">${e.petDescription}</div>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px;">
      <div style="background: #f5f5f5; border-radius: 6px; padding: 10px 12px;">
        <div style="font-size: 10px; text-transform: uppercase; color: #888; letter-spacing: 0.5px;">Breed</div>
        <div style="font-size: 14px; font-weight: bold; color: #222; margin-top: 2px;">${e.petBreed}</div>
      </div>
      <div style="background: #f5f5f5; border-radius: 6px; padding: 10px 12px;">
        <div style="font-size: 10px; text-transform: uppercase; color: #888; letter-spacing: 0.5px;">Color</div>
        <div style="font-size: 14px; font-weight: bold; color: #222; margin-top: 2px;">${e.petColor}</div>
      </div>
      <div style="background: #f5f5f5; border-radius: 6px; padding: 10px 12px;">
        <div style="font-size: 10px; text-transform: uppercase; color: #888; letter-spacing: 0.5px;">Last seen location</div>
        <div style="font-size: 14px; font-weight: bold; color: #222; margin-top: 2px;">${e.lastSeenLocation}</div>
      </div>
      <div style="background: #f5f5f5; border-radius: 6px; padding: 10px 12px;">
        <div style="font-size: 10px; text-transform: uppercase; color: #888; letter-spacing: 0.5px;">Last seen time</div>
        <div style="font-size: 14px; font-weight: bold; color: #222; margin-top: 2px;">${e.lastSeenTime}</div>
      </div>
    </div>
    <div style="background: #FAEEDA; border: 1px solid #EF9F27; border-radius: 6px;
             padding: 12px; text-align: center; font-weight: bold; color: #854F0B;
             margin-bottom: 16px; font-size: 15px;">${e.cta}</div>
    <div style="border-top: 1px solid #eee; padding-top: 14px; text-align: center;">
      <div style="font-size: 13px; color: #555; margin: 4px 0;">${e.contactName} 📞 ${e.contactPhone}</div>
    </div>
  </div>
  <div style="background: #f5f5f5; text-align: center; font-size: 11px; color: #888; padding: 10px;">
   <a href="https://spotapaw.com/sightings/${e.sightingId}" style="color: #888; text-decoration: none;">spotapaw.com/sightings/${e.sightingId} · report a sighting</a>
  </div>
  </body>
</html>`);
}
