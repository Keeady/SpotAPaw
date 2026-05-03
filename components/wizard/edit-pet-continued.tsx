import { ScrollView, StyleSheet, View } from "react-native";
import { Text, TextInput, RadioButton, HelperText } from "react-native-paper";
import { useEffect, useState } from "react";
import { AIFieldAnalysisBanner } from "../analyzer/ai-banner";
import { useAIFeatureContext } from "../Provider/ai-context-provider";
import { WizardHeader } from "./wizard-header";
import { PetThumbnail } from "../sightings/pet-selection";
import { SightingWizardStepData } from "./wizard-interface";
import { useTranslation } from "react-i18next";

export function EditPetContinued({
  updateSightingData,
  sightingFormData,
  loading: loadingAnalyzer,
  aiGenerated,
  isValidData,
  reportType,
}: SightingWizardStepData) {
  const { t } = useTranslation("wizard");
  const { isAiFeatureEnabled } = useAIFeatureContext();
  const [showAiGeneratedFlag, setShowAiGeneratedFlag] = useState(true);
  const [hasErrors, setHasErrors] = useState(false);

  const {
    photo,
    gender,
    size,
    features,
    age,
    name,
    id,
    petBehavior,
    collar,
    collarDescription,
    image,
  } = sightingFormData;

  useEffect(() => {
    setShowAiGeneratedFlag(!!isAiFeatureEnabled && !!aiGenerated);
  }, [aiGenerated, isAiFeatureEnabled]);

  useEffect(() => {
    if (!isValidData) {
      setHasErrors(true);
    } else {
      setHasErrors(false);
    }
  }, [isValidData]);

  return (
    <View style={{ flex: 1 }}>
      <WizardHeader
        title={t(
          "whatDidThePetLookLikeCont",
          "What did the pet look like? (Cont.)",
        )}
        subTitle={t("reviewAndEditPetDescription", "Review and edit pet description")}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <PetThumbnail
          setSelectedPetId={() => void 0}
          selectedPetId={""}
          petId={id}
          petName={name}
          petGender={gender}
          petAge={age}
          petPhoto={image.uri || photo}
          showDetails={false}
        />

        <View style={[styles.verticallySpaced, styles.mt10]}>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text variant="titleMedium">
              {t("distinctiveFeatures", "Distinctive Features:")}
            </Text>
            <HelperText
              type="error"
              visible={false}
              style={styles.helperText}
              padding="none"
            >
              {t("featureIsRequired", "Feature is required")}
            </HelperText>
            <AIFieldAnalysisBanner
              loading={loadingAnalyzer}
              aiGenerated={!!showAiGeneratedFlag && !!features}
            />
          </View>

          <TextInput
            placeholder={t(
              "describeUniqueMarkingsScarsMissingTeethEtc",
              "Describe unique markings, scars, missing teeth, etc.",
            )}
            value={features}
            onChangeText={(value) => updateSightingData("features", value)}
            mode={"outlined"}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={[styles.verticallySpaced]}>
          <HelperText
            type="error"
            visible={
              hasErrors &&
              !size &&
              (reportType === "lost_own" ||
                reportType === "new_pet" ||
                reportType === "edit_pet")
            }
            style={styles.helperText}
            padding="none"
          >
            {t("pleaseSelectPetSize", "Please select pet size!")}
          </HelperText>
          <AIFieldAnalysisBanner
            loading={loadingAnalyzer}
            aiGenerated={!!showAiGeneratedFlag && !!size}
          />
          <Text variant="titleMedium">
            {t(
              "howWouldYouDescribeThePetsSize",
              "How would you describe the pet's size?",
            )}
          </Text>
          <RadioButton.Group
            onValueChange={(value) => updateSightingData("size", value)}
            value={size}
          >
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
            onValueChange={(value) => updateSightingData("collar", value)}
            value={collar}
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

        {collar === "yes_collar" && (
          <View style={[styles.verticallySpaced, styles.mt10]}>
            <HelperText
              type="error"
              visible={hasErrors && !collarDescription}
              style={styles.helperText}
              padding="none"
            >
              {t("aDescriptionIsRequired", "A description is required!")}
            </HelperText>
            <AIFieldAnalysisBanner
              loading={loadingAnalyzer}
              aiGenerated={!!showAiGeneratedFlag && !!collarDescription}
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
              onChangeText={(value) =>
                updateSightingData("collarDescription", value)
              }
              mode={"outlined"}
              multiline
              numberOfLines={3}
            />
          </View>
        )}

        <View style={[styles.verticallySpaced, styles.mt20]}>
          <Text variant="titleMedium">
            {t("howIsThePetBehaving", "How is the pet behaving?")}
          </Text>
          <RadioButton.Group
            onValueChange={(value) => updateSightingData("petBehavior", value)}
            value={petBehavior}
          >
            <View style={styles.radioGroupCol}>
              <View style={styles.radioItem}>
                <RadioButton value="friendly" />
                <Text>
                  {t("friendlyApproachable", "Friendly & approachable")}
                </Text>
              </View>

              <View style={styles.radioItem}>
                <RadioButton value="scared" />
                <Text>{t("scaredOrSkittish", "Scared or skittish")}</Text>
              </View>

              <View style={styles.radioItem}>
                <RadioButton value="aggressive" />
                <Text>
                  {t("aggressiveOrDefensive", "Aggressive or defensive")}
                </Text>
              </View>

              <View style={styles.radioItem}>
                <RadioButton value="injured" />
                <Text>{t("injured", "Injured")}</Text>
              </View>
            </View>
          </RadioButton.Group>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 12,
    alignItems: "center",
    backgroundColor: "#fff",
    flexGrow: 1,
  },
  verticallySpaced: {
    alignSelf: "stretch",
  },
  mt20: {
    marginTop: 20,
  },
  mt10: {
    marginTop: 10,
  },
  radioGroupRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  radioGroupCol: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 8,
  },
  radioItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  helperText: {
    alignSelf: "flex-end",
    fontWeight: "bold",
  },
});
