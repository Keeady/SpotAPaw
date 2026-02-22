import {
  StyleSheet,
  View,
  Image,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Text, Button, Icon, HelperText } from "react-native-paper";
import { uploadOrTakePhoto } from "../image-picker";
import { useRouter } from "expo-router";
import { useCallback, useContext, useEffect, useState } from "react";
import { SightingWizardStepData } from "./wizard-form";
import { AuthContext } from "../Provider/auth-provider";
import { useAIFeatureContext } from "../Provider/ai-context-provider";
import { WizardHeader } from "./wizard-header";
import { PetImage } from "./wizard-interface";

export function UploadPhoto({
  updateSightingData,
  sightingFormData,
  loading,
  isValidData,
  errorMessage,
  onResetErrorMessage,
  onResetAiGeneratedPhoto,
}: SightingWizardStepData) {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const settingsRoute = user ? "/(app)/my-settings" : "/settings";
  const { isAiFeatureEnabled } = useAIFeatureContext();
  const [hasErrors, setHasErrors] = useState(false);

  useEffect(() => {
    if (!isValidData) {
      setHasErrors(true);
    } else {
      setHasErrors(false);
    }
  }, [isValidData]);

  const onAddPhoto = useCallback(
    (uri: string | null, fileName: string | null, mimeType: string | null) => {
      updateSightingData("image", {
        uri,
        filename: fileName,
        filetype: mimeType,
      } as PetImage);
      onResetErrorMessage?.();
      onResetAiGeneratedPhoto?.();
    },
    [updateSightingData, onResetErrorMessage, onResetAiGeneratedPhoto],
  );

  const { photo, image } = sightingFormData;

  return (
    <View style={{ flex: 1 }}>
      <WizardHeader
        title="Upload a photo"
        subTitle="A photo would really help identify this pet faster."
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.verticallySpaced, styles.mb10, styles.mt5]}>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <View
              style={{
                flexDirection: "row",
                gap: 8,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {isAiFeatureEnabled && loading && (
                <>
                  <ActivityIndicator size="small" color="#1976d2" />
                  <Text variant="labelMedium">Analyzing photo with AI...</Text>
                </>
              )}
            </View>

            <HelperText
              type="error"
              visible={(hasErrors && !photo && !image.uri) || !!errorMessage}
              style={styles.helperText}
              padding="none"
            >
              {!!errorMessage
                ? errorMessage
                : hasErrors && !photo && !image.uri
                  ? "Please add a photo!"
                  : ""}
            </HelperText>
          </View>
          {sightingFormData.image.uri ? (
            <Image
              source={{ uri: sightingFormData.image.uri }}
              style={styles.preview}
            />
          ) : sightingFormData.photo ? (
            <Image
              source={{ uri: sightingFormData.photo }}
              style={styles.preview}
            />
          ) : (
            <View style={styles.emptyPreview}>
              <Text>Add Photo</Text>
            </View>
          )}

          <Button
            icon="camera"
            mode="contained"
            onPress={() => uploadOrTakePhoto(onAddPhoto)}
            style={{ marginVertical: 10 }}
          >
            {sightingFormData.image.uri || sightingFormData.photo
              ? "Change Photo"
              : "Upload Photo"}
          </Button>

          <View>
            <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
              <Icon source={"creation-outline"} size={20} />
              <Text variant="labelMedium" style={{ flex: 1 }}>
                AI will fill out a detailed pet description from this photo. You
                can review and edit before submitting.
              </Text>
            </View>

            <Button mode="text" onPress={() => router.navigate(settingsRoute)}>
              {isAiFeatureEnabled ? "AI Settings" : "Turn AI On"}
            </Button>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  verticallySpaced: {
    alignSelf: "stretch",
  },
  mt20: {
    marginTop: 20,
  },
  mt5: {
    marginTop: 5,
  },
  mb10: {
    marginBottom: 10,
  },
  preview: {
    width: "100%",
    height: 300,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    marginTop: 5,
  },
  emptyPreview: {
    width: "100%",
    height: 300,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ddd",
    marginTop: 5,
  },
  content: {
    paddingHorizontal: 12,
    alignItems: "center",
  },
  helperText: {
    alignSelf: "flex-end",
    fontWeight: "bold",
  },
});
