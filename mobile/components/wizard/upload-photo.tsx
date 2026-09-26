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
import { AuthContext } from "../Provider/auth-provider";
import { useAIFeatureContext } from "../Provider/ai-context-provider";
import { WizardHeader } from "./wizard-header";
import { PetImage, SightingWizardStepData } from "./wizard-interface";
import { useTranslation } from "react-i18next";
import { useProContext } from "../Provider/pro-context-provider";
import SightingGallery from "../sightings/gallery";

export function UploadPhoto({
  updateSightingData,
  sightingFormData,
  loading,
  isValidData,
  errorMessage,
  onResetErrorMessage,
  onResetAiGeneratedPhoto,
}: SightingWizardStepData) {
  const { t } = useTranslation(["wizard", "translation"]);
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const settingsRoute = user ? "/(app)/my-settings" : "/settings";
  const { isAiFeatureEnabled } = useAIFeatureContext();
  const [hasErrors, setHasErrors] = useState(false);
  const { aiPhotoAnalysisAllowed, multiPhotoUploadAllowed } = useProContext();
  const [isVisibleGallery, setIsVisibleGallery] = useState(false);

  useEffect(() => {
    if (!isValidData) {
      setHasErrors(true);
    } else {
      setHasErrors(false);
    }
  }, [isValidData]);

  const onAddMultiplePhotos = useCallback(
    (photos: PetImage[]) => {
      updateSightingData("images", photos);
      onResetErrorMessage?.();
      onResetAiGeneratedPhoto?.();
    },
    [updateSightingData, onResetErrorMessage, onResetAiGeneratedPhoto],
  );

  const { photos, images } = sightingFormData;

  return (
    <View style={{ flex: 1 }}>
      <WizardHeader
        title={t("uploadAPhoto", "Upload a photo")}
        subTitle={t(
          "aPhotoWouldReallyHelpIdentifyThisPetFaster",
          "A photo would really help identify this pet faster.",
        )}
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
              {isAiFeatureEnabled && aiPhotoAnalysisAllowed && loading && (
                <>
                  <ActivityIndicator size="small" color="#1976d2" />
                  <Text variant="labelMedium">
                    {t("analyzingPhotoWithAi", "Analyzing photo with AI...")}
                  </Text>
                </>
              )}
            </View>

            <HelperText
              type="error"
              visible={
                (hasErrors && !photos?.length && !images?.length) ||
                !!errorMessage
              }
              style={styles.helperText}
              padding="none"
            >
              {!!errorMessage
                ? errorMessage
                : hasErrors && !photos?.length && !images?.length
                  ? t("pleaseAddAPhoto", "Please add a photo!")
                  : ""}
            </HelperText>
          </View>
          {sightingFormData.images && sightingFormData.images.length === 1 ? (
            <Image
              key={0}
              source={{ uri: sightingFormData.images[0].uri }}
              style={[styles.preview]}
              resizeMode="contain"
              testID={`imageUri-0`}
            />
          ) : sightingFormData.images && sightingFormData.images.length > 1 ? (
            <View style={styles.emptyPreview}>
              {sightingFormData.images.map((img, index) => (
                <Image
                  key={index}
                  source={{ uri: img.uri }}
                  style={[
                    styles.preview,
                    {
                      position: "absolute",
                      top: index * 20, // vertical offset per layer
                      left: index * 20, // horizontal offset per layer
                      zIndex: sightingFormData.images.length - index, // ensure the first image is on top
                    },
                  ]}
                  resizeMode="contain"
                  testID={`imageUri-${index}`}
                />
              ))}
            </View>
          ) : sightingFormData.photos && sightingFormData.photos.length > 0 ? (
            <SightingGallery
              images={sightingFormData.photos.map((photo) => ({ uri: photo }))}
              isVisible={isVisibleGallery}
              setIsVisible={setIsVisibleGallery}
              mainPhoto={sightingFormData.photos[0]}
            />
          ) : (
            <View style={[styles.emptyPreview, { backgroundColor: "#ddd" }]}>
              <Text>
                {t("addPhoto", "Add Photo", {
                  count: multiPhotoUploadAllowed ? 2 : 1,
                })}
              </Text>
            </View>
          )}

          <Button
            icon="camera"
            mode="contained"
            onPress={() =>
              uploadOrTakePhoto(t, onAddMultiplePhotos, multiPhotoUploadAllowed)
            }
            style={{ marginVertical: 10 }}
            testID="addPhotoBtn"
          >
            {sightingFormData.images?.length > 0 ||
            sightingFormData.photos?.length > 0
              ? t("changePhoto", "Change Photo", {
                  count: multiPhotoUploadAllowed ? 2 : 1,
                })
              : t("uploadPhoto", "Upload Photo", {
                  count: multiPhotoUploadAllowed ? 2 : 1,
                })}
          </Button>

          <View>
            <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
              <Icon source={"creation-outline"} size={20} />
              <Text variant="labelMedium" style={{ flex: 1 }}>
                {t(
                  "aiWillFillOut",
                  "AI will fill out a detailed pet description from this photo. You can review and edit before submitting.",
                )}
              </Text>
            </View>

            <Button mode="text" onPress={() => router.navigate(settingsRoute)}>
              {isAiFeatureEnabled
                ? aiPhotoAnalysisAllowed
                  ? t("aiSettings", "AI Settings")
                  : t("purchasePro", "Purchase PRO")
                : t("turnAiOn", "Turn AI On")}
            </Button>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  verticallySpaced: {
    flex: 1,
    alignSelf: "stretch",
    justifyContent: "center",
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
    height: "auto",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    marginTop: 5,
    aspectRatio: 1.5,
  },
  emptyPreview: {
    width: "100%",
    height: 300,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  helperText: {
    alignSelf: "flex-end",
    fontWeight: "bold",
  },
});
