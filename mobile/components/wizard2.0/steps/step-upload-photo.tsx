import {
  StyleSheet,
  View,
  Image,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Text, Button, Icon, HelperText } from "react-native-paper";
import { useRouter } from "expo-router";
import { useCallback, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { uploadOrTakePhoto } from "../../image-picker";
import { AuthContext } from "../../Provider/auth-provider";
import { useAIFeatureContext } from "../../Provider/ai-context-provider";
import { useProContext } from "../../Provider/pro-context-provider";
import SightingGallery from "../../sightings/gallery";
import type { PetImage } from "../../wizard/wizard-interface";
import type { WizardScreenProps } from "../wizard-types";

export function UploadPhotoStep({
  formData,
  loading,
  errorMessage,
  clearError,
  updateFormData,
  onComplete,
  registerSubmit,
}: WizardScreenProps) {
  const { t } = useTranslation(["wizard", "translation"]);
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const settingsRoute = user ? "/(app)/my-settings" : "/settings";
  const { isAiFeatureEnabled } = useAIFeatureContext();
  const { aiPhotoAnalysisAllowed, multiPhotoUploadAllowed } = useProContext();
  const [hasErrors, setHasErrors] = useState(false);
  const [isVisibleGallery, setIsVisibleGallery] = useState(false);

  const { photos, images, petDescription, petPhotos } = formData;
  const hasPhoto =
    !!photos?.length ||
    !!images?.length ||
    !!petPhotos?.length;

  // This screen's own onComplete: require a photo, then hand off to the base
  // one. Any AI analysis belongs in this step's configured onComplete, which
  // can return the analysed fields as a patch (or throw to show errorMessage).
  const handleComplete = useCallback(async () => {
    if (!hasPhoto) {
      setHasErrors(true);
      return;
    }
    setHasErrors(false);
    await onComplete();
  }, [hasPhoto, onComplete]);

  useEffect(() => {
    registerSubmit(handleComplete);
    return () => registerSubmit(null);
  }, [handleComplete, registerSubmit]);

  const onAddMultiplePhotos = useCallback(
    (picked: PetImage[]) => {
      updateFormData({ images: picked });
      setHasErrors(false);
      clearError();
    },
    [updateFormData, clearError],
  );

  const countOpt = { count: multiPhotoUploadAllowed ? 2 : 1 };
  const showError = (hasErrors && !hasPhoto) || !!errorMessage;

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={[styles.verticallySpaced, styles.mb10, styles.mt5]}>
        <View style={styles.statusRow}>
          <View style={styles.analyzing}>
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
            visible={showError}
            style={styles.helperText}
            padding="none"
          >
            {errorMessage
              ? errorMessage
              : t("pleaseAddAPhoto", "Please add a photo!")}
          </HelperText>
        </View>

        {images?.length === 1 ? (
          <Image
            source={{ uri: images[0].uri }}
            style={styles.preview}
            resizeMode="contain"
            testID="imageUri-0"
          />
        ) : images && images.length > 1 ? (
          <View style={styles.emptyPreview}>
            {images.map((img, index) => (
              <Image
                key={index}
                source={{ uri: img.uri }}
                style={[
                  styles.preview,
                  {
                    position: "absolute",
                    top: index * 20,
                    left: index * 20,
                    zIndex: images.length - index,
                  },
                ]}
                resizeMode="contain"
                testID={`imageUri-${index}`}
              />
            ))}
          </View>
        ) : petPhotos &&
          petPhotos.length > 0 ? (
          <SightingGallery
            images={petPhotos.map((photo) => ({
              uri: photo.publicUrl,
            }))}
            isVisible={isVisibleGallery}
            setIsVisible={setIsVisibleGallery}
            mainPhoto={petPhotos[0].publicUrl}
          />
        ) : photos && photos.length > 0 ? (
          <SightingGallery
            images={photos.map((photo) => ({ uri: photo }))}
            isVisible={isVisibleGallery}
            setIsVisible={setIsVisibleGallery}
            mainPhoto={photos[0]}
          />
        ) : (
          <View style={[styles.emptyPreview, { backgroundColor: "#ddd" }]}>
            <Text>{t("addPhoto", "Add Photo", countOpt)}</Text>
          </View>
        )}

        <Button
          icon="camera"
          mode="contained"
          disabled={loading}
          onPress={() =>
            uploadOrTakePhoto(t, onAddMultiplePhotos, multiPhotoUploadAllowed)
          }
          style={{ marginVertical: 10 }}
          testID="addPhotoBtn"
        >
          {hasPhoto
            ? t("changePhoto", "Change Photo", countOpt)
            : t("uploadPhoto", "Upload Photo", countOpt)}
        </Button>

        <View>
          <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
            <Icon source="creation-outline" size={20} />
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
  );
}

const styles = StyleSheet.create({
  verticallySpaced: { flex: 1, alignSelf: "stretch", justifyContent: "center" },
  mt5: { marginTop: 5 },
  mb10: { marginBottom: 10 },
  statusRow: { flexDirection: "row", justifyContent: "space-between" },
  analyzing: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    alignItems: "center",
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
  content: { flexGrow: 1, paddingHorizontal: 12, alignItems: "center" },
  helperText: { alignSelf: "flex-end", fontWeight: "bold" },
});
