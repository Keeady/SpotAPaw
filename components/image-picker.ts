import * as ImagePicker from "expo-image-picker";
import { Alert, Linking } from "react-native";
import { log } from "./logs";
import { createErrorLogMessage } from "./util";
import { t, TFunction } from "i18next";

export const ImagePickerHandler = async (
  handleChange: (f: string, v: string) => void,
  callback?: () => void,
) => {
  await requestMediaLibraryPermission(t);

  // No permissions request is necessary for launching the image library
  let result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    quality: 1,
  }).catch((err) => {
    const errorMessage = createErrorLogMessage(err);
    log(`launchImageLibraryAsync: ${errorMessage}`);
    return;
  });

  if (result && !result.canceled) {
    handleChange("photoUrl", result.assets[0].uri);
    handleChange("image", {
      uri: result.assets[0].uri,
      filename: result.assets[0].fileName,
      filetype: result.assets[0].mimeType,
    } as any);
    callback?.();
  }
};

export const pickImage = async (
  t: TFunction,
  setPhoto?: React.Dispatch<React.SetStateAction<string>>,
): Promise<ImagePicker.ImagePickerAsset | null> => {
  await requestMediaLibraryPermission(t);

  let result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    quality: 0.8,
  }).catch((err) => {
    const errorMessage = createErrorLogMessage(err);
    log(`pickImage: ${errorMessage}`);
  });

  if (!result || !result.assets || result.canceled) {
    return null;
  }

  const photUri = result.assets[0].uri;
  if (setPhoto) {
    setPhoto(photUri);
  }

  return result.assets[0];
};

export const takePhoto = async (
  t: TFunction,
  setPhoto?: React.Dispatch<React.SetStateAction<string>>,
): Promise<ImagePicker.ImagePickerAsset | null> => {
  await requestCameraPermission(t);

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ["images", "livePhotos"],
    allowsEditing: true,
    quality: 0.8,
    cameraType: ImagePicker.CameraType.back,
  }).catch((err) => {
    const errorMessage = createErrorLogMessage(err);
    log(`takePhoto: ${errorMessage}`);
  });

  if (!result || !result.assets || result.canceled) {
    return null;
  }

  const photUri = result.assets[0].uri;
  if (setPhoto) {
    setPhoto(photUri);
  }

  return result.assets[0];
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
): Promise<void> => {
  Alert.alert(
    t("addPhoto", "Add Photo", { ns: "translation" }),
    t("chooseOption", "Choose an option", { ns: "translation" }),
    [
      { text: t("cancel", "Cancel", { ns: "translation" }), style: "cancel" },
      {
        text: t("takePhoto", "Take Photo", { ns: "translation" }),
        onPress: async () => {
          const result = await takePhoto(t);
          if (result) {
            callback(result.uri, result.fileName || "", result?.mimeType || "");
          }
        },
      },
      {
        text: t("chooseFromLibrary", "Choose from Library", {
          ns: "translation",
        }),
        onPress: async () => {
          const result = await pickImage(t);
          if (result) {
            callback(result.uri, result.fileName || "", result?.mimeType || "");
          }
        },
      },
    ],
  );
};
