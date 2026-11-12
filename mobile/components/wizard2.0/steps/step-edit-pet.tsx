import { ScrollView, StyleSheet, View } from "react-native";
import {
  Text,
  TextInput,
  RadioButton,
  HelperText,
  Menu,
} from "react-native-paper";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AIFieldAnalysisBannerOrHelperText } from "../../analyzer/ai-banner";
import { useAIFeatureContext } from "../../Provider/ai-context-provider";
import { PetThumbnail } from "../../sightings/pet-selection";
import { supportedSpecies } from "../../util";
import type { SightingFormData, WizardScreenProps } from "../wizard-types";

export function EditPetStep({
  formData,
  loading,
  updateFormData,
  onComplete,
  registerSubmit,
}: WizardScreenProps) {
  const { t } = useTranslation("wizard");
  const { isAiFeatureEnabled } = useAIFeatureContext();
  const [hasErrors, setHasErrors] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedSpecies, setSelectedSpecies] = useState(
    formData.species || "",
  );

  const {
    colors,
    species,
    breed,
    gender,
    age,
    name,
    id,
    isLost,
    photos,
    images,
    reportType,
    aiGenerated,
    petPhotos,
    petDescription,
  } = formData;
  const showAiGeneratedFlag = !!isAiFeatureEnabled && !!aiGenerated;

  const isPetProfile = reportType === "new_pet" || reportType === "edit_pet";
  const needsFullDetails = reportType === "lost_own" || isPetProfile;

  // Which fields are currently invalid. Errors only show after a submit attempt.
  const errors = {
    isLost: isPetProfile && isLost === undefined,
    name: needsFullDetails && !name,
    colors: !colors,
    species: !species,
    breed: isPetProfile && !breed,
    age: needsFullDetails && !age,
    gender: needsFullDetails && !gender,
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
        petPhoto={
          images?.[0]?.uri ||
          petDescription?.petDescriptionPhotos?.[0].publicUrl ||
          petPhotos?.[0].publicUrl ||
          photos?.[0] ||
          ""
        }
        showDetails={false}
      />

      {isPetProfile && (
        <View style={[styles.verticallySpaced, styles.mt20]}>
          <View style={styles.row}>
            <Text variant="titleMedium">{t("isPetLost", "Is pet lost?")}</Text>
            <HelperText
              type="error"
              visible={hasErrors && errors.isLost}
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
            onValueChange={(value) => set({ isLost: value === "yes" })}
            // Empty until answered, so the required-field error is actually reachable.
            value={isLost === undefined ? "" : isLost ? "yes" : "no"}
          >
            <View style={styles.radioGroupRow}>
              <View style={styles.radioItem}>
                <RadioButton value="yes" disabled={loading} />
                <Text>{t("yes", "Yes")}</Text>
              </View>
              <View style={styles.radioItem}>
                <RadioButton value="no" disabled={loading} />
                <Text>{t("no", "No")}</Text>
              </View>
            </View>
          </RadioButton.Group>
        </View>
      )}

      <View style={[styles.verticallySpaced, styles.mt10]}>
        <View style={styles.row}>
          <Text variant="titleMedium">{t("name", "Name:")}</Text>
          <HelperText
            type="error"
            visible={hasErrors && errors.name}
            style={styles.helperText}
            padding="none"
          >
            {t("pleaseAddAPetName", "Please add a pet name!")}
          </HelperText>
        </View>
        <TextInput
          value={name}
          onChangeText={(value) => set({ name: value })}
          mode="outlined"
          style={{ backgroundColor: "#fff" }}
        />
      </View>

      <View style={[styles.verticallySpaced, styles.mt10]}>
        <View style={styles.row}>
          <Text variant="titleMedium">{t("colors", "Color(s):")}</Text>
          <AIFieldAnalysisBannerOrHelperText
            loading={loading}
            aiGenerated={showAiGeneratedFlag && !!colors}
            helperText={
              <HelperText
                type="error"
                visible={hasErrors && errors.colors}
                style={styles.helperText}
                padding="none"
              >
                {t("pleaseDescribePetColors", "Please describe pet color(s)!")}
              </HelperText>
            }
          />
        </View>
        <TextInput
          value={colors}
          onChangeText={(value) => set({ colors: value })}
          mode="outlined"
          style={{ backgroundColor: "#fff" }}
        />
      </View>

      <View style={[styles.verticallySpaced, styles.mt10]}>
        <View style={styles.row}>
          <Text variant="titleMedium">{t("species", "Species:")}</Text>
          <AIFieldAnalysisBannerOrHelperText
            loading={loading}
            aiGenerated={showAiGeneratedFlag && !!species}
            helperText={
              <HelperText
                type="error"
                visible={hasErrors && errors.species}
                style={styles.helperText}
                padding="none"
              >
                {t("speciesIsRequired", "Species is required!")}
              </HelperText>
            }
          />
        </View>

        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <TextInput
              placeholder={t("selectOrEnterSpecies", "Select or Enter species")}
              value={selectedSpecies}
              onPress={() => setMenuVisible(true)}
              mode="outlined"
              onChangeText={(value) => {
                set({ species: value });
                setSelectedSpecies(value);
              }}
              style={{ backgroundColor: "#fff" }}
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
                  set({ species: specie });
                  setMenuVisible(false);
                }}
              />
            );
          })}
        </Menu>
      </View>

      <View style={[styles.verticallySpaced, styles.mt10]}>
        <View style={styles.row}>
          <Text variant="titleMedium">{t("breeds", "Breed(s):")}</Text>
          <AIFieldAnalysisBannerOrHelperText
            loading={loading}
            aiGenerated={showAiGeneratedFlag && !!breed}
            helperText={
              <HelperText
                type="error"
                visible={hasErrors && errors.breed}
                style={styles.helperText}
                padding="none"
              >
                {t("breedIsRequired", "Breed is required")}
              </HelperText>
            }
          />
        </View>
        <TextInput
          placeholder={t("breedsIfKnown", "Breed(s) (if known)")}
          value={breed}
          onChangeText={(value) => set({ breed: value })}
          mode="outlined"
          style={{ backgroundColor: "#fff" }}
        />
      </View>

      <View style={[styles.verticallySpaced, styles.mt20]}>
        <View style={styles.row}>
          <Text variant="titleMedium">{t("age", "Age:")}</Text>
          <HelperText
            type="error"
            visible={hasErrors && errors.age}
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
          onChangeText={(v) => set({ age: Number(v) })}
          keyboardType="numeric"
          mode="outlined"
          style={{ backgroundColor: "#fff" }}
        />
      </View>

      <View style={[styles.verticallySpaced, styles.mt20]}>
        <View style={styles.row}>
          <Text variant="titleMedium">{t("gender", "Gender")}</Text>
          <HelperText
            type="error"
            visible={hasErrors && errors.gender}
            style={styles.helperText}
            padding="none"
          >
            {t("genderIsRequired", "Gender is required!")}
          </HelperText>
        </View>

        <RadioButton.Group
          onValueChange={(value) =>
            set({ gender: value as SightingFormData["gender"] })
          }
          value={gender ?? ""}
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
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 12, alignItems: "center" },
  verticallySpaced: { alignSelf: "stretch" },
  mt20: { marginTop: 20 },
  mt10: { marginTop: 10 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  radioGroupRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  radioItem: { flexDirection: "row", alignItems: "center" },
  helperText: { alignSelf: "flex-end", fontWeight: "bold" },
});
