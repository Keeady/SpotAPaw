import {
  StyleSheet,
  View,
  Image,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Text, Button, Icon, HelperText } from "react-native-paper";
import { ImagePickerHandler } from "../image-picker";
import { useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { SightingWizardStepData } from "./wizard-form";
import { AuthContext } from "../Provider/auth-provider";
import { useAIFeatureContext } from "../Provider/ai-context-provider";
import { WizardHeader } from "./wizard-header";

export function UploadPhoto({
  updateSightingData,
  sightingFormData,
  loading,
  isValidData,
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

  const { photo, photoUrl } = sightingFormData;

  return (
    <View>
      <WizardHeader
        title="Upload a photo"
        subTitle="A photo would really help identify this pet faster."
      />
      <View style={styles.content}>
        <View style={[styles.verticallySpaced, styles.mb10, styles.mt20]}>
          <HelperText
            type="error"
            visible={hasErrors && !photo && !photoUrl}
            style={styles.helperText}
            padding="none"
          >
            Please add a photo!
          </HelperText>
          {sightingFormData.photoUrl ? (
            <Image
              source={{ uri: sightingFormData.photoUrl }}
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
            onPress={() => ImagePickerHandler(updateSightingData)}
            style={{ marginVertical: 10 }}
          >
            {sightingFormData.photoUrl || sightingFormData.photo
              ? "Change Photo"
              : "Upload Photo"}
          </Button>

          <View>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Icon source={"creation-outline"} size={20} />
              {isAiFeatureEnabled ? (
                <Text variant="labelMedium" style={{ flex: 1 }}>
                  AI will generate a detailed pet description based on this
                  photo. You can review and edit before submitting.
                </Text>
              ) : (
                <Text variant="labelMedium" style={{ flex: 1 }}>
                  AI can generate a detailed pet description based on this
                  photo. You can review and edit before submitting.
                </Text>
              )}
            </View>

            <Button mode="text" onPress={() => router.navigate(settingsRoute)}>
              {isAiFeatureEnabled
                ? "Manage AI Analysis Settings"
                : "Enable AI Analysis"}
            </Button>
          </View>
          {isAiFeatureEnabled && (
            <View>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {loading && (
                  <>
                    <ActivityIndicator size="small" color="#1976d2" />
                    <Text variant="labelMedium">
                      Analyzing photo with AI...
                    </Text>
                  </>
                )}

                {!loading && sightingFormData.aiMessage && (
                  <Text variant="labelMedium">
                    Note: {sightingFormData.aiMessage}
                  </Text>
                )}
              </View>
            </View>
          )}
        </View>
      </View>
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
  mt10: {
    marginTop: 10,
  },
  mb10: {
    marginBottom: 10,
  },
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
    minHeight: "100%",
    paddingBottom: 40,
  },
  title: {
    marginBottom: 20,
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
    paddingHorizontal: 24,
    alignItems: "center",
  },
  header: {
    backgroundColor: "#714ea9ff",
    padding: 16,
    paddingTop: Platform.OS === "ios" ? 50 : 16,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#BBDEFB",
    marginTop: 4,
  },
  helperText: {
    alignSelf: "flex-end",
  },
});
