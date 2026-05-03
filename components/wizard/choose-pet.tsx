import { useRouter } from "expo-router";
import { useContext, useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, HelperText } from "react-native-paper";
import { AuthContext } from "../Provider/auth-provider";
import { PetSelection } from "../sightings/pet-selection";
import { WizardHeader } from "./wizard-header";
import { SightingPet, SightingWizardStepData } from "./wizard-interface";
import { PetRepository } from "@/db/repositories/pet-repository";
import { showMessage } from "react-native-flash-message";
import { log } from "../logs";
import { createErrorLogMessage } from "../util";
import { useTranslation } from "react-i18next";

export function ChoosePet({
  updateSightingData,
  sightingFormData,
  isValidData,
}: SightingWizardStepData) {
  const { t } = useTranslation("wizard");
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const [pets, setPets] = useState<SightingPet[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string>("");
  const [hasErrors, setHasErrors] = useState(false);
  const [loading, setLoading] = useState(false);

  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

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
      const petRepository = new PetRepository();
      petRepository
        .getPets(user.id)
        .then((data) => {
          if (!isMountedRef.current) {
            return;
          }

          if (data && data.length > 0) {
            setPets(data);
          }
        })
        .catch((error) => {
          const errorMessage = createErrorLogMessage(error);
          log(`Failed to fetch pets for user: ${errorMessage}`);
          showMessage({
            message: t("errorFetchingPetsInfo", "Error fetching pets info."),
            type: "warning",
            icon: "warning",
            statusBarHeight: 50,
          });
        })
        .finally(() => {
          if (!isMountedRef.current) {
            return;
          }
          setLoading(false);
        });
    }
  }, [user?.id]);

  useEffect(() => {
    if (!isMountedRef.current) {
      return;
    }
    if (selectedPetId) {
      const pet = pets.find((p) => p.id === selectedPetId);
      if (pet) {
        updateSightingData("species", pet.species);
        updateSightingData("age", pet.age);
        updateSightingData("name", pet.name);
        updateSightingData("breed", pet.breed);
        updateSightingData("colors", pet.colors);
        updateSightingData("gender", pet.gender);
        updateSightingData("features", pet.features);
        updateSightingData("note", pet.note);
        updateSightingData("photo", pet.photo);
        updateSightingData("isLost", pet.isLost);
        updateSightingData("id", pet.id);
      }
    }
  }, [selectedPetId, pets, updateSightingData]);

  const { id } = sightingFormData;

  return (
    <View style={styles.container}>
      <WizardHeader
        title={t("selectAPetProfile", "Select a pet profile")}
        subTitle={t("sorryToHearYourPetIsMissing", "Sorry to hear your pet is missing. Let's bring them back!")}
      />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {!user && (
          <View style={{ flexGrow: 1, justifyContent: "center" }}>
            <Button
              mode="contained"
              onPress={() => router.navigate("/")}
              style={styles.button}
            >
              {t("signInOrCreateAnAccount", "Sign in or create an account")}
            </Button>
          </View>
        )}
        {loading && <ActivityIndicator size={"large"} />}
        {user && (
          <HelperText
            type="error"
            visible={hasErrors && !id}
            style={styles.helperText}
            padding="none"
          >
            {t("pleaseSelectAPet", "Please select a pet!")}
          </HelperText>
        )}
        <PetSelection
          selectedPetId={selectedPetId || sightingFormData.id}
          setSelectedPetId={setSelectedPetId}
          pets={pets}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 12,
    flexGrow: 1,
  },
  helperText: {
    alignSelf: "flex-end",
    fontWeight: "bold",
  },
  button: {
    width: "100%",
    marginBottom: 16,
    borderWidth: 1,
    borderRadius: 12,
  },
});
