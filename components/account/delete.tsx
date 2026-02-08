import { supabase } from "../supabase-client";
import { showMessage } from "react-native-flash-message";
import { handleSignOut, isValidUuid } from "../util";
import { log } from "../logs";
import { router } from "expo-router";

export const onDeleteAccount = async (userId: string) => {
  if (!isValidUuid(userId)) {
    showMessage({
      message: "Invalid user ID.",
      type: "warning",
      icon: "warning",
      statusBarHeight: 50,
    });
    return;
  }

  const { error } = await supabase
    .from("owner")
    .update({ marked_for_deletion: true })
    .eq("owner_id", userId);

  if (error) {
    log(error.message);
    showMessage({
      message: "Error deleting account.",
      type: "warning",
      icon: "warning",
      statusBarHeight: 50,
    });
  } else {
    showMessage({
      message: "Successfully deleted account and all associated pets.",
      type: "success",
      icon: "success",
      statusBarHeight: 50,
    });

    handleSignOut(router);
  }
};
