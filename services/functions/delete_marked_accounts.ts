import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseUrl || !supabaseKey) {
  const error = "Missing environment variables";
  throw new Error(error);
}

const supabaseClient = createClient(supabaseUrl, supabaseKey);

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

Deno.serve(async (req) => {
  const cutoffDate = new Date(Date.now() - SEVEN_DAYS_MS).toISOString();

  // Fetch accounts to delete
  const { data: accounts, error: fetchError } = await supabaseClient
    .from("owner")
    .select("owner_id")
    .eq("marked_for_deletion", true)
    .lt("deleted_at", cutoffDate);

  if (fetchError) {
    console.error("Error fetching accounts marked for deletion:", fetchError);
    return getErrorResponse("Error fetching accounts", 500);
  }

  if (!accounts?.length) {
    return new Response(
      JSON.stringify({ message: "No accounts to delete", deleted: 0 }),
      {
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const ids = accounts.map((a) => a.owner_id);

  // Delete from auth.users — cascades to owner table if FK is set up
  const authDeletions = await Promise.allSettled(
    ids.map((id) => supabaseClient.auth.admin.deleteUser(id, true)),
  );

  const succeeded = authDeletions.filter(
    (r) => r.status === "fulfilled" && !r.value.error,
  );
  const failed = authDeletions.filter(
    (r) => r.status === "rejected" || r.value?.error,
  );

  return new Response(
    JSON.stringify({
      deleted: succeeded.length,
      failed: failed.length,
      errors: failed.map((f) =>
        f.status === "rejected" ? f.reason : f.value.error,
      ),
    }),
    { headers: { "Content-Type": "application/json" } },
  );
});
