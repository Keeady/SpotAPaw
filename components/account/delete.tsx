import { showMessage } from "react-native-flash-message";
import { createErrorLogMessage, handleSignOut, isValidUuid } from "../util";
import { router } from "expo-router";
import { OwnerRepository } from "@/db/repositories/owner-repository";
import { log } from "../logs";
import { TFunction } from "i18next";

export const onDeleteAccount = async (userId: string, t: TFunction) => {
  if (!isValidUuid(userId)) {
    showMessage({
      message: t("invalidUserId", "Invalid user ID.", { ns: "auth" }),
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
        message: t(
          "successfullyDeletedAccount",
          "Successfully deleted account and all associated pets.",
          { ns: "auth" },
        ),
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
        message: t("errorDeletingAccount", "Error deleting account.", {
          ns: "auth",
        }),
        type: "warning",
        icon: "warning",
        statusBarHeight: 50,
      });
    });
};
