import { ScrollView, StyleSheet, View } from "react-native";
import { Text, TextInput, RadioButton, HelperText } from "react-native-paper";
import { useEffect, useState } from "react";
import { SightingWizardStepData } from "./wizard-form";
import { AIFieldAnalysisBanner } from "../analyzer/ai-banner";
import { useAIFeatureContext } from "../Provider/ai-context-provider";
import { WizardHeader } from "./wizard-header";
import { PetThumbnail } from "../sightings/pet-selection";

export function EditPetContinued({
  updateSightingData,
  sightingFormData,
  loading: loadingAnalyzer,
  aiGenerated,
  isValidData,
  reportType,
}: SightingWizardStepData) {
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
        title="What did the pet look like? (Cont.)"
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
            <Text variant="titleMedium">Distinctive Features:</Text>
            <HelperText
              type="error"
              visible={false}
              style={styles.helperText}
              padding="none"
            >
              Feature is required
            </HelperText>
            <AIFieldAnalysisBanner
              loading={loadingAnalyzer}
              aiGenerated={!!showAiGeneratedFlag && !!features}
            />
          </View>

          <TextInput
            placeholder="Unique markings, scars, missing teeth, etc."
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
            visible={hasErrors && !size && reportType === "lost_own"}
            style={styles.helperText}
            padding="none"
          >
            Please select pet size!
          </HelperText>
          <AIFieldAnalysisBanner
            loading={loadingAnalyzer}
            aiGenerated={!!showAiGeneratedFlag && !!size}
          />
          <Text variant="titleMedium">
            How would you describe the pet&#39;s size?
          </Text>
          <RadioButton.Group
            onValueChange={(value) => updateSightingData("size", value)}
            value={size}
          >
            <View style={styles.radioGroupCol}>
              <View style={styles.radioItem}>
                <RadioButton value="small" />
                <Text>Small (under 20 lbs)</Text>
              </View>

              <View style={styles.radioItem}>
                <RadioButton value="medium" />
                <Text>Medium (20-50 lbs)</Text>
              </View>

              <View style={styles.radioItem}>
                <RadioButton value="large" />
                <Text>Large (over 50 lbs)</Text>
              </View>
            </View>
          </RadioButton.Group>
        </View>

        <View style={[styles.verticallySpaced, styles.mt20]}>
          <Text variant="titleMedium">
            Does the pet have any collars, tags, or harness on?
          </Text>
          <RadioButton.Group
            onValueChange={(value) => updateSightingData("collar", value)}
            value={collar}
          >
            <View style={styles.radioGroupRow}>
              <View style={styles.radioItem}>
                <RadioButton value="yes_collar" />
                <Text>Yes</Text>
              </View>

              <View style={styles.radioItem}>
                <RadioButton value="no" />
                <Text>No</Text>
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
              A description is required!
            </HelperText>
            <AIFieldAnalysisBanner
              loading={loadingAnalyzer}
              aiGenerated={!!showAiGeneratedFlag && !!collarDescription}
            />
            <Text variant="labelLarge">
              Please describe any Collar, Tag, or Harness:
            </Text>
            <TextInput
              label={"Collar, Tag, & Harness"}
              placeholder="colors, numbers, markings, brand, etc."
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
          <Text variant="titleMedium">How is the pet behaving?</Text>
          <RadioButton.Group
            onValueChange={(value) => updateSightingData("petBehavior", value)}
            value={petBehavior}
          >
            <View style={styles.radioGroupCol}>
              <View style={styles.radioItem}>
                <RadioButton value="friendly" />
                <Text>Friendly & approachable</Text>
              </View>

              <View style={styles.radioItem}>
                <RadioButton value="scared" />
                <Text>Scared or skittish</Text>
              </View>

              <View style={styles.radioItem}>
                <RadioButton value="aggressive" />
                <Text>Aggressive or defensive</Text>
              </View>

              <View style={styles.radioItem}>
                <RadioButton value="injured" />
                <Text>Injured</Text>
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
