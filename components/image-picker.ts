import * as ImagePicker from "expo-image-picker";
import { Alert, Linking } from "react-native";
import { log } from "./logs";
import { createErrorLogMessage } from "./util";
import { t, TFunction } from "i18next";
import { PetImage } from "./wizard/wizard-interface";
import { MAX_SELECTED_IMAGES } from "./constants";

export const pickImage = async (
  t: TFunction,
  allowsMultipleSelection = false,
): Promise<ImagePicker.ImagePickerAsset[] | null> => {
  await requestMediaLibraryPermission(t);

  let result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: !allowsMultipleSelection,
    quality: 0.8,
    allowsMultipleSelection: !!allowsMultipleSelection,
    selectionLimit: MAX_SELECTED_IMAGES,
  }).catch((err) => {
    const errorMessage = createErrorLogMessage(err);
    log(`pickImage: ${errorMessage}`);
  });

  if (!result || !result.assets || result.canceled) {
    return null;
  }

  return result.assets;
};

export const takePhoto = async (
  t: TFunction,
  allowsMultipleSelection = false,
): Promise<ImagePicker.ImagePickerAsset[] | null> => {
  await requestCameraPermission(t);

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ["images", "livePhotos"],
    allowsEditing: !allowsMultipleSelection,
    quality: 0.8,
    cameraType: ImagePicker.CameraType.back,
    allowsMultipleSelection: !!allowsMultipleSelection,
    selectionLimit: MAX_SELECTED_IMAGES,
  }).catch((err) => {
    const errorMessage = createErrorLogMessage(err);
    log(`takePhoto: ${errorMessage}`);
  });

  if (!result || !result.assets || result.canceled) {
    return null;
  }

  return result.assets;
};

const checkCameraPermission = async () => {
  const { status } = await ImagePicker.getCameraPermissionsAsync();
  return status === "granted";
};

const checkMediaLibraryPermission = async () => {
  const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
  return status === "granted";
};

export const requestCameraPermission = async (t: TFunction) => {
  const existingStatus = await checkCameraPermission();
  if (existingStatus) {
    return true;
  }

  const { status } = await ImagePicker.requestCameraPermissionsAsync();

  if (status === "denied") {
    Alert.alert(
      t("cameraPermissionRequired", "Camera Permission Required", {
        ns: "translation",
      }),
      t(
        "pleaseEnableCameraAccess",
        "Please enable camera access in your device settings to take a pet photo to help identify pets faster.",
        { ns: "translation" },
      ),
      [
        { text: t("cancel", "Cancel", { ns: "translation" }), style: "cancel" },
        {
          text: t("openSettings", "Open Settings", { ns: "translation" }),
          onPress: () => Linking.openSettings(),
        },
      ],
    );
    return false;
  }

  return status === "granted";
};

export const requestMediaLibraryPermission = async (t: TFunction) => {
  const existingStatus = await checkMediaLibraryPermission();

  if (existingStatus) {
    return true;
  }

  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (status === "denied") {
    Alert.alert(
      t("photoLibraryPermissionRequired", "Photo Library Permission Required", {
        ns: "translation",
      }),
      t(
        "pleaseEnablePhotoLibraryAccess",
        "Please enable photo library access in your device settings to share a pet photo to help identify pets faster.",
        { ns: "translation" },
      ),
      [
        { text: t("cancel", "Cancel", { ns: "translation" }), style: "cancel" },
        {
          text: t("openSettings", "Open Settings", { ns: "translation" }),
          onPress: () => Linking.openSettings(),
        },
      ],
    );
    return false;
  }

  return status === "granted";
};

export const uploadOrTakePhoto = async (
  callback: (
    uri: string | null,
    fileName: string | null,
    mimeType: string | null,
  ) => void,
  t: TFunction,
  callbackForMultiplePhotos?: (photos: PetImage[]) => void,
  allowsMultipleSelection = false,
): Promise<void> => {
  Alert.alert(
    t("addPhoto", "Add Photo", {
      ns: "translation",
      count: allowsMultipleSelection ? 2 : 1,
    }),
    t("chooseOption", "Choose an option", { ns: "translation" }),
    [
      { text: t("cancel", "Cancel", { ns: "translation" }), style: "cancel" },
      {
        text: t("takePhoto", "Take Photo", {
          ns: "translation",
          count: allowsMultipleSelection ? 2 : 1,
        }),
        onPress: async () => {
          const result = await takePhoto(t, allowsMultipleSelection);
          if (result && result.length > 0) {
            if (allowsMultipleSelection && callbackForMultiplePhotos) {
              callbackForMultiplePhotos(
                result.map((asset) => ({
                  uri: asset.uri,
                  filename: asset.fileName || "",
                  filetype: asset.mimeType || "",
                })),
              );
            } else {
              callback(
                result[0].uri,
                result[0].fileName || "",
                result[0].mimeType || "",
              );
            }
          }
        },
      },
      {
        text: t("chooseFromLibrary", "Choose from Library", {
          ns: "translation",
        }),
        onPress: async () => {
          const result = await pickImage(t, allowsMultipleSelection);
          if (result && result.length > 0) {
            if (allowsMultipleSelection && callbackForMultiplePhotos) {
              callbackForMultiplePhotos(
                result.map((asset) => ({
                  uri: asset.uri,
                  filename: asset.fileName || "",
                  filetype: asset.mimeType || "",
                })),
              );
            } else {
              callback(
                result[0].uri,
                result[0].fileName || "",
                result[0].mimeType || "",
              );
            }
          }
        },
      },
    ],
  );
};
