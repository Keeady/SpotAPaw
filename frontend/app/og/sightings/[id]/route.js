import {
  CRAWLERS,
  UUID_REGEX,
  getSupabase,
  html,
  renderHead,
  text,
} from "../../../../lib/og.js";

// export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  const { WEBSITE_URL, APP_URL } = process.env;
  if (!WEBSITE_URL) return text("Server misconfigured: WEBSITE_URL", 500);

  const { id: sightingId } = await params; // works on Next 14 and 15
  const petId = new URL(request.url).searchParams.get("petId");

  if (!sightingId || !UUID_REGEX.test(sightingId)) {
    return text("Invalid sighting ID", 400);
  }
  if (petId && !UUID_REGEX.test(petId)) {
    return text("Invalid pet ID", 400);
  }

  const suffix = petId ? `?petId=${petId}` : "";
  const userUrl = `${WEBSITE_URL}/aggregated-sightings/${sightingId}${suffix}`;
  const ogUrl = `${WEBSITE_URL}/og/sightings/${sightingId}${suffix}`;
  const deepLink = `${APP_URL}/sightings/${sightingId}`;

  // Humans get sent to the real page
  const ua = request.headers.get("user-agent") || "";
  if (!CRAWLERS.test(ua)) {
    return Response.redirect(userUrl, 302);
  }

  const supabase = getSupabase();
  if (!supabase) return text("Server misconfigured: SUPABASE URL or KEY", 500);

  const { data, error } = await supabase
    .from("aggregated_sightings")
    .select("*")
    .eq("id", sightingId)
    .single();

  if (error || !data) {
    console.error("Supabase error: ", error);
    return text("Sighting info not found", 404);
  }

  const status = data.is_active ? "Active" : "Found";
  const title = `SpotAPaw Lost Pet: ${data.name} - [${status}]`;
  const description = `Help reunite this pet: ${data.gender} ${data.breed} ${data.species}. Features: ${data.features}`;
  const image = data.photos?.length
    ? data.photos[0]
    : `${WEBSITE_URL}/default-og.png`;

  return html(`<!DOCTYPE html>
<html>
  <head>${renderHead({ title, description, image, ogUrl, deepLink })}
  </head>
  <body></body>
</html>`);
}
