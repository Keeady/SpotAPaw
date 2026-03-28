import { showMessage } from "react-native-flash-message";
import { createErrorLogMessage, handleSignOut, isValidUuid } from "../util";
import { router } from "expo-router";
import { OwnerRepository } from "@/db/repositories/owner-repository";
import { log } from "../logs";

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

  const repository = new OwnerRepository();
  await repository
    .deleteOwner(userId)
    .then(() => {
      showMessage({
        message: "Successfully deleted account and all associated pets.",
        type: "success",
        icon: "success",
        statusBarHeight: 50,
      });

      handleSignOut(router);
    })
    .catch((error) => {
      const errorMessage = createErrorLogMessage(error);
      log(`Failed to delete account for: ${errorMessage}`);
      showMessage({
        message: "Error deleting account.",
        type: "warning",
        icon: "warning",
        statusBarHeight: 50,
      });
    });
};
