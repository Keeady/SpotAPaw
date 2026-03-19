import { showMessage } from "react-native-flash-message";
import { handleSignOut, isValidUuid } from "../util";
import { router } from "expo-router";
import { OwnerRepository } from "@/db/repositories/owner-repository";

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
    .catch(() => {
      showMessage({
        message: "Error deleting account.",
        type: "warning",
        icon: "warning",
        statusBarHeight: 50,
      });
    });
};
