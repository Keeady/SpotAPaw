import * as ImagePicker from "expo-image-picker";
import { Alert, Linking } from "react-native";
import { log } from "./logs";

export const ImagePickerHandler = async (
  handleChange: (f: string, v: string) => void
) => {
  // No permissions request is necessary for launching the image library
  let result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [4, 3],
    quality: 1,
  }).catch((err) => {
    log(`launchImageLibraryAsync: ${err.message}`);
    return;
  });

  if (result && !result.canceled) {
    handleChange("photoUrl", result.assets[0].uri);
  }
};

export const pickImage = async (
  setPhoto?: React.Dispatch<React.SetStateAction<string>>
): Promise<string | null> => {
  // No permissions request is necessary for launching the image library
  let result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    quality: 0.8,
  }).catch((err) => {
    log(`pickImage: ${err.message}`);
  });

  if (!result || !result.assets || result.canceled) {
    return null;
  }

  const photUri = result.assets[0].uri;
  if (setPhoto) {
    setPhoto(photUri);
  }

  return photUri;
};

export const takePhoto = async (
  setPhoto?: React.Dispatch<React.SetStateAction<string>>
): Promise<string | null> => {
  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ["images", "livePhotos"],
    allowsEditing: true,
    quality: 0.8,
    cameraType: ImagePicker.CameraType.back,
  }).catch((err) => {
    log(`takePhoto: ${err.message}`);
  });

  if (!result || !result.assets || result.canceled) {
    return null;
  }

  const photUri = result.assets[0].uri;
  if (setPhoto) {
    setPhoto(photUri);
  }

  return photUri;
};

const checkCameraPermission = async () => {
  const { status } = await ImagePicker.getCameraPermissionsAsync();
  return status === "granted";
};

const checkMediaLibraryPermission = async () => {
  const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
  return status === "granted";
};

export const requestCameraPermission = async () => {
  const existingStatus = await checkCameraPermission();
  if (existingStatus) {
    return true;
  }

  const { status } = await ImagePicker.requestCameraPermissionsAsync();

  if (status === "denied") {
    Alert.alert(
      "Camera Permission Required",
      "Please enable camera access in your device settings to take photos.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Open Settings", onPress: () => Linking.openSettings() },
      ]
    );
    return false;
  }

  return status === "granted";
};

export const requestMediaLibraryPermission = async () => {
  const existingStatus = await checkMediaLibraryPermission();

  if (existingStatus) {
    return true;
  }

  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (status === "denied") {
    Alert.alert(
      "Photo Library Permission Required",
      "Please enable photo library access in your device settings to upload photos.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Open Settings", onPress: () => Linking.openSettings() },
      ]
    );
    return false;
  }

  return status === "granted";
};

export const uploadOrTakePhoto = async (
  callback: (uri: string | null) => void
): Promise<void> => {
  Alert.alert("Add Photo", "Choose an option", [
    { text: "Cancel", style: "cancel" },
    {
      text: "Take Photo",
      onPress: async () => {
        const result = await takePhoto();
        callback(result);
      },
    },
    {
      text: "Choose from Library",
      onPress: async () => {
        const result = await pickImage();
        callback(result);
      },
    },
  ]);
};
