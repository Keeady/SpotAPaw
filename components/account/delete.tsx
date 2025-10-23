import { useCallback } from "react";
import { Alert } from "react-native";
import { supabase } from "../supabase-client";
import { showMessage } from "react-native-flash-message";
import { isValidUuid } from "../util";
import { router } from "expo-router";

export const useConfirmDelete = () =>
  useCallback(
    (userId: string) =>
      Alert.alert(
        `Deleting Account`,
        `Are you sure you want to delete your account? This action cannot be undone. All your pets' profiles will also be deleted.`,
        [
          {
            text: "Cancel",
            onPress: () => console.log("Cancel Pressed"),
            style: "cancel",
          },
          {
            text: "Yes, please delete everything",
            onPress: () => onDeleteAccount(userId),
          },
        ],
        {
          userInterfaceStyle: "dark",
        }
      ),
    []
  );

const onDeleteAccount = async (userId: string) => {
  if (!isValidUuid(userId)) {
    showMessage({
      message: "Invalid user ID.",
      type: "warning",
      icon: "warning",
    });
    return;
  }

  const { error } = await supabase
    .from("owner")
    .update({ deleted_at: new Date() })
    .eq("owner_id", userId);

  if (error) {
    showMessage({
      message: "Error deleting account.",
      type: "warning",
      icon: "warning",
    });
  } else {
    showMessage({
      message: "Successfully deleted account and all associated pets.",
      type: "success",
      icon: "success",
    });

    router.navigate(`/`);
  }
};
