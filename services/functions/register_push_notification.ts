import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseUrl || !supabaseKey) {
  const error = "Missing environment variables";
  throw new Error(error);
}

const supabaseClient = createClient(supabaseUrl, supabaseKey);

async function getExistingSightingSubscription(
  notification_push_token: string,
) {
  try {
    const { error, data } = await supabaseClient
      .from("sighting_subscriptions")
      .select("*")
      .eq("notification_push_token", notification_push_token);
    if (error) {
      return;
    }

    return data;
  } catch (error) {
    console.log("Failed to update notification subscription:", error);
    return;
  }
}

async function registerForPushNotification(
  notificationToken: string,
  locationLat: number,
  locationLong: number,
  radius_km: number,
) {
  try {
    const { error, data } = await supabaseClient
      .from("sighting_subscriptions")
      .insert(
        {
          notification_push_token: notificationToken,
          center: `POINT(${locationLong} ${locationLat})`, // PostGIS: lon first
          radius_km: radius_km,
          enabled: true,
        },
        { onConflict: "notification_push_token" },
      );
    if (error) {
      return;
    }

    return data;
  } catch (error) {
    return;
  }
}

Deno.serve(async (req: Request) => {
  const { notificationToken, locationLat, locationLong, radius_km } =
    await req.json();

  if (
    !notificationToken ||
    locationLat === undefined ||
    locationLong === undefined ||
    radius_km === undefined
  ) {
    return new Response("Missing required fields", { status: 400 });
  }

  const existingSubscription =
    await getExistingSightingSubscription(notificationToken);

  if (existingSubscription && existingSubscription.length > 0) {
    return new Response("Subscription already exists", { status: 200 });
  }

  const subscription = await registerForPushNotification(
    notificationToken,
    locationLat,
    locationLong,
    radius_km,
  );

  if (!subscription) {
    return new Response("Failed to register subscription", { status: 500 });
  }

  return new Response("Subscription registered successfully", { status: 201 });
});
