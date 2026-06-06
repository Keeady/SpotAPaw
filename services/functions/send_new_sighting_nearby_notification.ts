import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const accessToken = Deno.env.get("EXPO_PUSH_NOTIFICATION_ACCESS_TOKEN");

if (!supabaseUrl || !supabaseKey || !accessToken) {
  const error = "Missing environment variables";
  throw new Error(error);
}

const supabaseClient = createClient(supabaseUrl, supabaseKey);

Deno.serve(async (req: Request) => {
  const { record } = await req.json();
  const latitude = record.last_seen_lat;
  const longitude = record.last_seen_long;
  const sightingId = record.id;
  const species = record.species;
  const petName = record.name || `this ${species}`;
  const colors = record.colors || "";
  const breed = record.breed || "";
  const collar = record.collar_description
    ? `${record.collar_description} and`
    : "";
  const features = record.features || "";
  const linkedSightingId = record.linked_sighting_id;
  const petId = record.pet_id;

  let subscribers;

  try {
    const { data, error } = await supabaseClient.rpc(
      "get_nearby_sighting_subscribers",
      {
        last_seen_long: longitude,
        last_seen_lat: latitude,
      },
    );

    if (error) {
      console.error(error);
      return new Response(`Error fetching subscribers: ${error.message}`, {
        status: 500,
      });
    }

    subscribers = data;
    if (!subscribers || subscribers.length === 0) {
      return new Response("No subscribers found", { status: 200 });
    }
  } catch (error) {
    console.error(error);
    return new Response(`Error fetching subscribers: ${error.message}`, {
      status: 500,
    });
  }

  const messageTitle = `Have you seen ${petName}?`;
  const messageBody = `Looking for a ${colors} ${breed} ${species} nearby with ${collar} ${features}.`;

  // handle first 100 subscribers
  // TODO: implement batching for more subscribers if needed
  const messages = subscribers.map((s) => ({
    to: s.notification_push_token,
    sound: "default",
    title: messageTitle,
    body: messageBody.trim(),
    data: {
      sightingId: sightingId,
      linkedSightingId: linkedSightingId,
      petId: petId,
    },
  }));

  try {
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(messages),
    });

    const results = await response.json();

    if (!response.ok) {
      return new Response("Failed to send notifications", { status: 500 });
    }

    if (!results.data || results.data.length === 0) {
      return new Response("No notifications were sent", { status: 200 });
    }
  } catch (error) {
    console.error(error);
    return new Response(`Error sending notifications: ${error.message}`, {
      status: 500,
    });
  }

  return new Response("Notifications sent", { status: 200 });
});
