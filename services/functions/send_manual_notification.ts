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
  let subscribers;

  try {
    const { data } = await supabaseClient
      .from("sighting_subscriptions")
      .select("*")
      .eq("enabled", true);
    subscribers = data;
    if (!subscribers || subscribers.length === 0) {
      return new Response("No subscribers found", { status: 200 });
    }
  } catch (error) {
    return new Response("Error fetching subscribers", { status: 500 });
  }

  const messageTitle = `Have you seen this pet?`;
  const messageBody = `Looking for a pet nearby.`;

  // handle first 100 subscribers
  // TODO: implement batching for more subscribers if needed
  const messages = subscribers.map((s) => ({
    to: s.notification_push_token,
    sound: "default",
    title: messageTitle,
    body: messageBody.trim(),
    data: {
      sightingId: "c7deb858-4d03-4cf2-a8ed-746a9ea32df8",
      petId: "d050bdf9-1c35-4b37-96d8-8b3b1387aa9c",
      linkedSightingId: "fb7e9f14-9eef-4e69-bcad-87f43d41dc4d",
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

    await response.json();

    if (!response.ok) {
      return new Response("Failed to send notifications", { status: 500 });
    }
  } catch (error) {
    return new Response("Error sending notifications", { status: 500 });
  }

  return new Response("Notifications sent", { status: 200 });
});
