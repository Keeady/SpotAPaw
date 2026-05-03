import { ScrollView, StyleSheet, View } from "react-native";
import {
  Text,
  TextInput,
  RadioButton,
  HelperText,
  Menu,
} from "react-native-paper";
import { useEffect, useState } from "react";
import { AIFieldAnalysisBanner } from "../analyzer/ai-banner";
import { useAIFeatureContext } from "../Provider/ai-context-provider";
import { WizardHeader } from "./wizard-header";
import { PetThumbnail } from "../sightings/pet-selection";
import { SightingWizardStepData } from "./wizard-interface";
import { useTranslation } from "react-i18next";
import { supportedSpecies } from "../util";

export function EditPet({
  updateSightingData,
  sightingFormData,
  loading: loadingAnalyzer,
  aiGenerated,
  reportType,
  isValidData,
}: SightingWizardStepData) {
  const { t } = useTranslation("wizard");
  const { isAiFeatureEnabled } = useAIFeatureContext();
  const [showAiGeneratedFlag, setShowAiGeneratedFlag] = useState(true);
  const [hasErrors, setHasErrors] = useState(false);
  const [visible, setVisible] = useState(false);
  const [selectedSpecies, setSelectedSpecies] = useState(
    sightingFormData.species || "",
  );

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const {
    photo,
    colors,
    species,
    breed,
    gender,
    age,
    name,
    id,
    image,
    isLost,
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
        title={t("whatDidThePetLookLike", "What did the pet look like?")}
        subTitle={t(
          "reviewAndEditPetDescription",
          "Review and edit pet description",
        )}
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
        {(reportType === "new_pet" || reportType === "edit_pet") && (
          <View style={[styles.verticallySpaced, styles.mt20]}>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text variant="titleMedium">
                {t("isPetLost", "Is pet lost?")}
              </Text>
              <HelperText
                type="error"
                visible={hasErrors && isLost === undefined}
                style={styles.helperText}
                padding="none"
              >
                {t(
                  "pleaseIndicateIfThePetIsLost",
                  "Please indicate if the pet is lost!",
                )}
              </HelperText>
            </View>

            <RadioButton.Group
              onValueChange={(value) =>
                updateSightingData("isLost", value === "yes")
              }
              value={isLost ? "yes" : "no"}
            >
              <View style={styles.radioGroupRow}>
                <View style={styles.radioItem}>
                  <RadioButton value="yes" />
                  <Text>{t("yes", "Yes")}</Text>
                </View>

                <View style={styles.radioItem}>
                  <RadioButton value="no" />
                  <Text>{t("no", "No")}</Text>
                </View>
              </View>
            </RadioButton.Group>
          </View>
        )}
        <View style={[styles.verticallySpaced, styles.mt10]}>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text variant="titleMedium">{t("name", "Name:")}</Text>
            <HelperText
              type="error"
              visible={
                hasErrors &&
                !name &&
                (reportType === "lost_own" ||
                  reportType === "new_pet" ||
                  reportType === "edit_pet")
              }
              style={styles.helperText}
              padding="none"
            >
              {t("pleaseAddAPetName", "Please add a pet name!")}
            </HelperText>
          </View>

          <TextInput
            value={name}
            onChangeText={(value) => updateSightingData("name", value)}
            mode={"outlined"}
          />
        </View>
        <View style={[styles.verticallySpaced, styles.mt10]}>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text variant="titleMedium">{t("colors", "Color(s):")}</Text>
            <HelperText
              type="error"
              visible={hasErrors && !colors}
              style={styles.helperText}
              padding="none"
            >
              {t("pleaseDescribePetColors", "Please describe pet color(s)!")}
            </HelperText>

            <AIFieldAnalysisBanner
              loading={loadingAnalyzer}
              aiGenerated={showAiGeneratedFlag && !!colors}
            />
          </View>
          <TextInput
            value={colors}
            onChangeText={(value) => updateSightingData("colors", value)}
            mode={"outlined"}
          />
        </View>
        <View style={[styles.verticallySpaced, styles.mt10]}>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text variant="titleMedium">{t("species", "Species:")}</Text>
            <HelperText
              type="error"
              visible={hasErrors && !species}
              style={styles.helperText}
              padding="none"
            >
              {t("speciesIsRequired", "Species is required!")}
            </HelperText>
            <AIFieldAnalysisBanner
              loading={loadingAnalyzer}
              aiGenerated={!!showAiGeneratedFlag && !!species}
            />
          </View>

          <Menu
            visible={visible}
            onDismiss={closeMenu}
            anchor={
              <TextInput
                placeholder="Select species"
                value={selectedSpecies}
                onPress={openMenu}
                mode="outlined"
                onChangeText={(value) => {
                  updateSightingData("species", value);
                  setSelectedSpecies(value);
                }}
              />
            }
          >
            {supportedSpecies.map((specie) => {
              const translatedSpecie = t(`animal.${specie}`, specie, {
                ns: "translation",
              });
              return (
                <Menu.Item
                  key={specie}
                  title={translatedSpecie}
                  onPress={() => {
                    setSelectedSpecies(translatedSpecie);
                    updateSightingData("species", specie);
                    closeMenu();
                  }}
                />
              );
            })}
          </Menu>
        </View>
        <View style={[styles.verticallySpaced, styles.mt10]}>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text variant="titleMedium">{t("breeds", "Breed(s):")}</Text>
            <HelperText
              type="error"
              visible={
                hasErrors &&
                (reportType === "new_pet" || reportType === "edit_pet") &&
                !breed
              }
              style={styles.helperText}
              padding="none"
            >
              {t("breedIsRequired", "Breed is required")}
            </HelperText>
            <AIFieldAnalysisBanner
              loading={loadingAnalyzer}
              aiGenerated={!!showAiGeneratedFlag && !!breed}
            />
          </View>

          <TextInput
            placeholder={t("breedsIfKnown", "Breed(s) (if known)")}
            value={breed}
            onChangeText={(value) => updateSightingData("breed", value)}
            mode={"outlined"}
          />
        </View>

        <View style={[styles.verticallySpaced, styles.mt20]}>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text variant="titleMedium">{t("age", "Age:")}</Text>
            <HelperText
              type="error"
              visible={
                hasErrors &&
                !age &&
                (reportType === "lost_own" ||
                  reportType === "new_pet" ||
                  reportType === "edit_pet")
              }
              style={styles.helperText}
              padding="none"
            >
              {t(
                "pleaseProvideApproximateAge",
                "Please provide approximate age!",
              )}
            </HelperText>
          </View>
          <TextInput
            placeholder={t("howOld", "how old?")}
            value={age?.toString() || ""}
            onChangeText={(v) => updateSightingData("age", v)}
            keyboardType="numeric"
            mode="outlined"
          />
        </View>

        <View style={[styles.verticallySpaced, styles.mt20]}>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text variant="titleMedium">{t("gender", "Gender")}</Text>
            <HelperText
              type="error"
              visible={
                hasErrors &&
                !gender &&
                (reportType === "lost_own" ||
                  reportType === "new_pet" ||
                  reportType === "edit_pet")
              }
              style={styles.helperText}
              padding="none"
            >
              {t("genderIsRequired", "Gender is required!")}
            </HelperText>
          </View>

          <RadioButton.Group
            onValueChange={(value) => updateSightingData("gender", value)}
            value={gender}
          >
            <View style={styles.radioGroupRow}>
              <View style={styles.radioItem}>
                <RadioButton value="Female" />
                <Text>{t("female", "Female")}</Text>
              </View>

              <View style={styles.radioItem}>
                <RadioButton value="Male" />
                <Text>{t("male", "Male")}</Text>
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
