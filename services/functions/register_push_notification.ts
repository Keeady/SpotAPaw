import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseUrl || !supabaseKey) {
  const error = "Missing environment variables";
  throw new Error(error);
}

const supabaseClient = createClient(supabaseUrl, supabaseKey);

function getErrorResponse(error: string, status: number = 400, code?: string) {
  return new Response(
    JSON.stringify({
      error,
      success: false,
      code,
    }),
    {
      headers: { "Content-Type": "application/json" },
      status,
    },
  );
}

function getSuccessResponse(message: string, data: any = []) {
  return new Response(
    JSON.stringify({
      success: true,
      message,
      data,
    }),
    {
      headers: { "Content-Type": "application/json" },
      status: 200,
    },
  );
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
    return getErrorResponse("Missing required fields", 400);
  }

  let existingSubscription;
  try {
    const { error, data } = await supabaseClient
      .from("sighting_subscriptions")
      .select("*")
      .eq("notification_push_token", notificationToken);

    if (error) {
      return getErrorResponse(error.message, 500);
    }

    existingSubscription = data;
  } catch (error) {
    return getErrorResponse(error.message, 500);
  }

  if (existingSubscription && existingSubscription.length > 0) {
    return getSuccessResponse("Subscription already exists");
  }

  try {
    const { error } = await supabaseClient
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
      return getErrorResponse(error.message, 500);
    }

  } catch (error) {
    return getErrorResponse(error.message, 500);
  }

  return getSuccessResponse("Subscription registered successfully.")
});
