import { ScrollView, StyleSheet, View } from "react-native";
import { Text, TextInput, RadioButton, HelperText } from "react-native-paper";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AIFieldAnalysisBannerOrHelperText } from "../../analyzer/ai-banner";
import { useAIFeatureContext } from "../../Provider/ai-context-provider";
import { PetThumbnail } from "../../sightings/pet-selection";
import type { SightingFormData, WizardScreenProps } from "../wizard-types";

export function EditPetContinuedStep({
  formData,
  loading,
  updateFormData,
  onComplete,
  registerSubmit,
}: WizardScreenProps) {
  const { t } = useTranslation("wizard");
  const { isAiFeatureEnabled } = useAIFeatureContext();
  const [hasErrors, setHasErrors] = useState(false);

  const {
    gender,
    size,
    features,
    age,
    name,
    id,
    behavior,
    collar,
    collarDescription,
    images,
    photos,
    reportType,
    aiGenerated,
  } = formData;
  const showAiGeneratedFlag = !!isAiFeatureEnabled && !!aiGenerated;

  const needsFullDetails =
    reportType === "lost_own" || reportType === "new_pet" || reportType === "edit_pet";

  const errors = {
    size: needsFullDetails && !size,
    collarDescription: collar === "yes_collar" && !collarDescription,
  };
  const isValid = !Object.values(errors).some(Boolean);

  // This screen's own onComplete: validate, then hand off to the base one.
  const handleComplete = useCallback(async () => {
    if (!isValid) {
      setHasErrors(true);
      return;
    }
    setHasErrors(false);
    await onComplete();
  }, [isValid, onComplete]);

  useEffect(() => {
    registerSubmit(handleComplete);
    return () => registerSubmit(null);
  }, [handleComplete, registerSubmit]);

  const set = (patch: SightingFormData) => updateFormData(patch);

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <PetThumbnail
        setSelectedPetId={() => void 0}
        selectedPetId={""}
        petId={id || ""}
        petName={name || ""}
        petGender={gender || ""}
        petAge={age || 0}
        petPhoto={images?.[0]?.uri || photos?.[0] || ""}
        showDetails={false}
      />

      <View style={[styles.verticallySpaced, styles.mt10]}>
        <View style={styles.row}>
          <Text variant="titleMedium">
            {t("distinctiveFeatures", "Distinctive Features:")}
          </Text>
          {/* Features are optional, so there is no error state here. */}
          <AIFieldAnalysisBannerOrHelperText
            loading={loading}
            aiGenerated={showAiGeneratedFlag && !!features}
            helperText={<></>}
          />
        </View>

        <TextInput
          placeholder={t(
            "describeUniqueMarkingsScarsMissingTeethEtc",
            "Describe unique markings, scars, missing teeth, etc.",
          )}
          value={features}
          onChangeText={(value) => set({ features: value })}
          mode="outlined"
          multiline
          numberOfLines={3}
          style={{backgroundColor: "#fff"}}
        />
      </View>

      <View style={styles.verticallySpaced}>
        <AIFieldAnalysisBannerOrHelperText
          loading={loading}
          aiGenerated={showAiGeneratedFlag && !!size}
          helperText={
            <HelperText
              type="error"
              visible={hasErrors && errors.size}
              style={styles.helperText}
              padding="none"
            >
              {t("pleaseSelectPetSize", "Please select pet size!")}
            </HelperText>
          }
        />
        <Text variant="titleMedium">
          {t("howWouldYouDescribeThePetsSize", "How would you describe the pet's size?")}
        </Text>
        <RadioButton.Group onValueChange={(value) => set({ size: value })} value={size ?? ""}>
          <View style={styles.radioGroupCol}>
            <View style={styles.radioItem}>
              <RadioButton value="small" />
              <Text>{t("smallUnder20Lbs", "Small (under 20 lbs)")}</Text>
            </View>
            <View style={styles.radioItem}>
              <RadioButton value="medium" />
              <Text>{t("medium2050Lbs", "Medium (20-50 lbs)")}</Text>
            </View>
            <View style={styles.radioItem}>
              <RadioButton value="large" />
              <Text>{t("largeOver50Lbs", "Large (over 50 lbs)")}</Text>
            </View>
          </View>
        </RadioButton.Group>
      </View>

      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Text variant="titleMedium">
          {t(
            "doesThePetHaveAnyCollarsTagsOrHarnessOn",
            "Does the pet have any collars, tags, or harness on?",
          )}
        </Text>
        <RadioButton.Group
          onValueChange={(value) => set({ collar: value })}
          value={collar ?? ""}
        >
          <View style={styles.radioGroupRow}>
            <View style={styles.radioItem}>
              <RadioButton value="yes_collar" />
              <Text>{t("yes", "Yes")}</Text>
            </View>
            <View style={styles.radioItem}>
              <RadioButton value="no" />
              <Text>{t("no", "No")}</Text>
            </View>
          </View>
        </RadioButton.Group>
      </View>

      {(collar === "yes_collar" || collarDescription) && (
        <View style={[styles.verticallySpaced, styles.mt10]}>
          <AIFieldAnalysisBannerOrHelperText
            loading={loading}
            aiGenerated={showAiGeneratedFlag && !!collarDescription}
            helperText={
              <HelperText
                type="error"
                visible={hasErrors && errors.collarDescription}
                style={styles.helperText}
                padding="none"
              >
                {t("aDescriptionIsRequired", "A description is required!")}
              </HelperText>
            }
          />
          <Text variant="labelLarge">
            {t(
              "pleaseDescribeAnyCollarTagOrHarness",
              "Please describe any Collar, Tag, or Harness:",
            )}
          </Text>
          <TextInput
            label={t("collarTagHarness", "Collar, Tag, & Harness")}
            placeholder={t(
              "describeColorsNumbersMarkingsBrandEtc",
              "Describe colors, numbers, markings, brand, etc.",
            )}
            value={collarDescription}
            onChangeText={(value) => set({ collarDescription: value })}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={{backgroundColor: "#fff"}}
          />
        </View>
      )}

      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Text variant="titleMedium">
          {t("howIsThePetBehaving", "How is the pet behaving?")}
        </Text>
        <RadioButton.Group
          onValueChange={(value) => set({ behavior: value })}
          value={behavior ?? ""}
        >
          <View style={styles.radioGroupCol}>
            <View style={styles.radioItem}>
              <RadioButton value="friendly" />
              <Text>{t("friendlyApproachable", "Friendly & approachable")}</Text>
            </View>
            <View style={styles.radioItem}>
              <RadioButton value="scared" />
              <Text>{t("scaredOrSkittish", "Scared or skittish")}</Text>
            </View>
            <View style={styles.radioItem}>
              <RadioButton value="aggressive" />
              <Text>{t("aggressiveOrDefensive", "Aggressive or defensive")}</Text>
            </View>
            <View style={styles.radioItem}>
              <RadioButton value="injured" />
              <Text>{t("injured", "Injured")}</Text>
            </View>
          </View>
        </RadioButton.Group>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 12,
    alignItems: "center",
    backgroundColor: "#fff",
    flexGrow: 1,
  },
  verticallySpaced: { alignSelf: "stretch" },
  mt20: { marginTop: 20 },
  mt10: { marginTop: 10 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  radioGroupRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  radioGroupCol: { flexDirection: "column", alignItems: "flex-start", gap: 8 },
  radioItem: { flexDirection: "row", alignItems: "center" },
  helperText: { alignSelf: "flex-end", fontWeight: "bold" },
});