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
    const { data } = await supabaseClient.from("sighting_subscriptions").select("*").eq("enabled", true);
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
    data: { sightingId: "c7deb858-4d03-4cf2-a8ed-746a9ea32df8" },
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

    const staleTokens = results.data
      .filter((r) => r.details?.error === "DeviceNotRegistered")
      .map((r) => r.details.expoPushToken); // Expo echoes the token back on error

    if (staleTokens.length > 0) {
      await supabaseClient
        .from("sighting_subscriptions")
        .delete()
        .in("notification_push_token", staleTokens);
    }
  } catch (error) {
    return new Response("Error sending notifications", { status: 500 });
  }

  return new Response("Notifications sent", { status: 200 });
});
