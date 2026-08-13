import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface TelemetryEvent {
  correlation_id: string;
  event: string;
  steps: {
    step: string;
    duration_ms: number;
    start: number;
    end: number;
  }[];
  duration_ms: number;
  data?: Record<string, any>;
}

interface ReqPayload {
  events: TelemetryEvent[];
}

function getErrorResponse(
  message: string,
  status: number = 400,
  code?: string,
) {
  return new Response(
    JSON.stringify({
      message,
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

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY");

Deno.serve(async (req: Request) => {
  const headers = req.headers.get("Authorization");

  if (!headers || !headers.startsWith("Bearer ")) {
    const error = "Missing or invalid Authorization header";
    console.error(error);
    return getErrorResponse(error, 401);
  }

  if (!supabaseUrl || !supabaseKey) {
    const error = "Missing environment variables";
    console.error(error);
    return getErrorResponse(error, 500);
  }

  const supabase = createClient(supabaseUrl ?? "", supabaseKey ?? "", {
    global: {
      headers: { Authorization: headers ?? "" },
    },
  });

  try {
    const { events }: ReqPayload = await req.json();

    const data = events.map((event) => {
      if (!event.correlation_id || !event.event || !event.steps || event.steps.length === 0 || event.duration_ms === undefined) {
        throw new Error(
          "Invalid telemetry event: correlation_id, event, steps, and duration_ms are required",
        );
      }

      return {
        correlation_id: event.correlation_id,
        event: event.event,
        steps: event.steps,
        duration_ms: event.duration_ms,
        data: event.data || {},
      };
    });

    const { error } = await supabase.from("telemetry").insert(data);

    if (error) {
      console.error("Failed to insert telemetry event:", error);
      return getErrorResponse("Failed to insert telemetry event", 500);
    }

    return getSuccessResponse("Telemetry event logged successfully");
  } catch (error) {
    console.error("Error processing telemetry event:", error);
    return getErrorResponse("Error processing telemetry event", 500);
  }
});
