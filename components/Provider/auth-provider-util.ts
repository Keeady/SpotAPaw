import { Session, SupabaseClient } from "@supabase/supabase-js";
import { log } from "../logs";

export async function checkOwnerMarkedForDeletion(
  supabase: SupabaseClient,
  session: Session,
) {
  const { data: owner, error: selectError } = await supabase
    .from("owner")
    .select("marked_for_deletion")
    .eq("owner_id", session.user.id);

  if (selectError) {
    log(`AuthProvider select owner error: ${selectError.message}`);
    return;
  }

  if (owner && owner.length > 0) {
    return owner[0].marked_for_deletion;
  }
}

export async function resetOwnerMarkedForDeletion(
  supabase: SupabaseClient,
  userId: string,
) {
  const { error: updateError } = await supabase
    .from("owner")
    .update({
      marked_for_deletion: false,
      deleted_at: null,
    })
    .eq("owner_id", userId);
  if (updateError) {
    log(`AuthProvider update owner error: ${updateError.message}`);
    return;
  }
}
