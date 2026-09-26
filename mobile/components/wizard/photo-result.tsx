import { StyleSheet, View, Image, ScrollView } from "react-native";
import { Text } from "react-native-paper";
import { useState } from "react";
import { WizardHeader } from "./wizard-header";
import { SightingWizardStepData } from "./wizard-interface";
import { useTranslation } from "react-i18next";
import { useProContext } from "../Provider/pro-context-provider";
import SightingGallery from "../sightings/gallery";

export function PhotoResult({ sightingFormData }: SightingWizardStepData) {
  const { t } = useTranslation(["wizard", "translation"]);
  const { multiPhotoUploadAllowed } = useProContext();
  const [isVisibleGallery, setIsVisibleGallery] = useState(false);

  const { aiNote, confidence, narrative, best_photo_url } = sightingFormData;

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <WizardHeader
        title={t("aiPhotoAnalysis", "AI Photo Analysis")}
        subTitle={t(
          "photoAnalysisDescription",
          "View AI analysis of your photos and pet identification.",
        )}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.verticallySpaced, styles.mb10, styles.mt5]}>
          {best_photo_url ? (
            <Image
              key={0}
              source={{ uri: best_photo_url }}
              style={[styles.preview]}
              resizeMode="contain"
              testID={`imageUri-0`}
            />
          ) : sightingFormData.images &&
            sightingFormData.images.length === 1 ? (
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

          <View>
            <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
              <Text variant="labelMedium">
                {t("photoQuality", "Photo Quality:")}
              </Text>
              <Text variant="bodyMedium">
                {t(`photoConfidence.${confidence}`, confidence)}
              </Text>
            </View>
            <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
              <Text variant="labelMedium">{t("summary", "AI Summary:")}</Text>
              <Text variant="bodyMedium" style={{ flex: 1 }}>
                {narrative}
              </Text>
            </View>
            <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
              <Text variant="labelMedium">{t("notes", "Notes:")}</Text>
              <Text variant="bodyMedium" style={{ flex: 1 }}>
                {aiNote}
              </Text>
            </View>
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
    paddingHorizontal: 12,
    alignItems: "center",
    flex: 1,
  },
  helperText: {
    alignSelf: "flex-end",
    fontWeight: "bold",
  },
});
