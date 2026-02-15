import { View, StyleSheet } from "react-native";
import { SightingWizardStepData } from "./wizard-form";
import { WizardHeader } from "./wizard-header";
import {
  ActivityIndicator,
  HelperText,
} from "react-native-paper";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../Provider/auth-provider";
import { supabase } from "../supabase-client";
import { Pet } from "@/model/pet";
import { PetSelection } from "../sightings/pet-selection";

export function ChoosePet({
  updateSightingData,
  sightingFormData,
  isValidData,
}: SightingWizardStepData) {
  const { user } = useContext(AuthContext);

  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string>("");
  const [hasErrors, setHasErrors] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isValidData) {
      setHasErrors(true);
    } else {
      setHasErrors(false);
    }
  }, [isValidData]);

  useEffect(() => {
    if (user?.id) {
      setLoading(true);
      supabase
        .from("pets")
        .select("*")
        .eq("owner_id", user.id)
        .then(({ data }) => {
          setLoading(false);
          if (data && data.length > 0) {
            setPets(data);
          }
        });
    }
  }, [user?.id]);

  useEffect(() => {
    if (selectedPetId) {
      const pet = pets.find((p) => p.id === selectedPetId);
      if (pet) {
        Object.keys(pet).map((key) => {
          if (key in pet) {
            updateSightingData(key, pet[key]);
          }
        });
      }
    }
  }, [selectedPetId, pets, updateSightingData]);

  const { id } = sightingFormData;

  return (
    <View style={styles.container}>
      <WizardHeader
        title="Select a pet profile"
        subTitle="Sorry to hear your pet is missing. Let's bring them back!"
      />
      <View style={styles.content}>
        {loading && <ActivityIndicator size={"large"} />}
        <HelperText
          type="error"
          visible={hasErrors && !id}
          style={styles.helperText}
          padding="none"
        >
          Please select a pet!
        </HelperText>
        <PetSelection
          selectedPetId={selectedPetId || sightingFormData.id}
          setSelectedPetId={setSelectedPetId}
          pets={pets}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    // flexDirection: "row",
    // justifyContent: "center",
    padding: 24,
  },
  navigationCard: {
    borderRadius: 16,
    marginBottom: 10,
  },
  navigationItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  steps: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    marginBottom: 20,
    textAlign: "center",
  },
  cardContainer: {
    // marginBottom: 30,
  },
  disabledCard: {
    opacity: 0.6,
  },
  helperText: {
    alignSelf: "flex-end",
  },
});
