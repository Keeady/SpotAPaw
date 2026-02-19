import { ScrollView, StyleSheet, View } from "react-native";
import { Text, TextInput, RadioButton, HelperText } from "react-native-paper";
import { useEffect, useState } from "react";
import { SightingWizardStepData } from "./wizard-form";
import { AIFieldAnalysisBanner } from "../analyzer/ai-banner";
import { useAIFeatureContext } from "../Provider/ai-context-provider";
import { WizardHeader } from "./wizard-header";
import { PetThumbnail } from "../sightings/pet-selection";

export function EditPet({
  updateSightingData,
  sightingFormData,
  loading: loadingAnalyzer,
  aiGenerated,
  reportType,
  isValidData,
}: SightingWizardStepData) {
  const { isAiFeatureEnabled } = useAIFeatureContext();
  const [showAiGeneratedFlag, setShowAiGeneratedFlag] = useState(true);
  const [hasErrors, setHasErrors] = useState(false);

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
        title="What did the pet look like?"
        subTitle="Review and edit pet description"
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
        />
        <View style={[styles.verticallySpaced, styles.mt10]}>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text variant="titleMedium">Name:</Text>
            <HelperText
              type="error"
              visible={hasErrors && !name && reportType === "lost_own"}
              style={styles.helperText}
              padding="none"
            >
              Please add a pet name!
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
            <Text variant="titleMedium">Color(s):</Text>
            <HelperText
              type="error"
              visible={hasErrors && !colors}
              style={styles.helperText}
              padding="none"
            >
              Please describe pet color(s)!
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
            <Text variant="titleMedium">Species:</Text>
            <HelperText
              type="error"
              visible={hasErrors && !species}
              style={styles.helperText}
              padding="none"
            >
              Species is required!
            </HelperText>
            <AIFieldAnalysisBanner
              loading={loadingAnalyzer}
              aiGenerated={!!showAiGeneratedFlag && !!species}
            />
          </View>

          <TextInput
            placeholder="Dog/Cat/Hamster/Rabbit/Snake/Horse/Chicken"
            value={species}
            onChangeText={(value) => updateSightingData("species", value)}
            mode={"outlined"}
          />
        </View>
        <View style={[styles.verticallySpaced, styles.mt10]}>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text variant="titleMedium">Breed(s):</Text>
            <HelperText
              type="error"
              visible={false}
              style={styles.helperText}
              padding="none"
            >
              Breed is required
            </HelperText>
            <AIFieldAnalysisBanner
              loading={loadingAnalyzer}
              aiGenerated={!!showAiGeneratedFlag && !!breed}
            />
          </View>

          <TextInput
            placeholder="Breed(s) (if known)"
            value={breed}
            onChangeText={(value) => updateSightingData("breed", value)}
            mode={"outlined"}
          />
        </View>

        <View style={[styles.verticallySpaced, styles.mt20]}>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text variant="titleMedium">Age:</Text>
            <HelperText
              type="error"
              visible={hasErrors && !age && reportType === "lost_own"}
              style={styles.helperText}
              padding="none"
            >
              Please provide approximate age!
            </HelperText>
          </View>
          <TextInput
            placeholder={"how old?"}
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
            <Text variant="titleMedium">Gender</Text>
            <HelperText
              type="error"
              visible={hasErrors && !gender && reportType === "lost_own"}
              style={styles.helperText}
              padding="none"
            >
              Gender is required!
            </HelperText>
          </View>

          <RadioButton.Group
            onValueChange={(value) => updateSightingData("gender", value)}
            value={gender}
          >
            <View style={styles.radioGroupRow}>
              <View style={styles.radioItem}>
                <RadioButton value="Female" />
                <Text>Female</Text>
              </View>

              <View style={styles.radioItem}>
                <RadioButton value="Male" />
                <Text>Male</Text>
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
