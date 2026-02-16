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
    photoUrl,
    photo,
    colors,
    species,
    breed,
    gender,
    size,
    features,
    age,
    name,
    id,
    petBehavior,
    collar,
    collarDescription,
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
          petPhoto={photoUrl || photo}
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

        <View style={[styles.verticallySpaced]}>
          <HelperText
            type="error"
            visible={hasErrors && !size}
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
    paddingHorizontal: 24,
    alignItems: "center",
  },
  stepContent: {
    // flex: 1,
    // marginBottom: 16,
  },
  verticallySpaced: {
    alignSelf: "stretch",
    // backgroundColor: "blue"
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
    // justifyContent: "flex-start"
  },
  helperText: {
    alignSelf: "flex-end",
  },
});
