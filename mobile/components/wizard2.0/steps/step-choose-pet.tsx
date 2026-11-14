import { useRouter } from "expo-router";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Button,
  HelperText,
  Text,
} from "react-native-paper";
import { showMessage } from "react-native-flash-message";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../../Provider/auth-provider";
import { PetSelection } from "../../sightings/pet-selection";
import { PetRepository } from "@/db/repositories/pet-repository";
import { log } from "../../logs";
import { createErrorLogMessage } from "../../util";
import type { SightingPet } from "../../wizard/wizard-interface";
import type { WizardScreenProps } from "../wizard-types";

export function ChoosePetStep({
  formData,
  onComplete,
  registerSubmit,
}: WizardScreenProps) {
  const { t } = useTranslation(["wizard", "petprofile"]);
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const [pets, setPets] = useState<SightingPet[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string>(formData.petId ?? "");
  const [hasErrors, setHasErrors] = useState(false);
  const [loading, setLoading] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    new PetRepository()
      .getPets(user.id)
      .then((data) => {
        if (isMountedRef.current && data?.length) setPets(data);
      })
      .catch((error) => {
        log(`Failed to fetch pets for user: ${createErrorLogMessage(error)}`);
        showMessage({
          message: t("errorFetchingPetsInfo", "Error fetching pets info."),
          type: "warning",
          icon: "warning",
          statusBarHeight: 50,
        });
      })
      .finally(() => {
        if (isMountedRef.current) setLoading(false);
      });
  }, [user?.id]);

  // This screen's own onComplete: validate, copy the pet into the form, hand off.
  const handleComplete = useCallback(async () => {
    const pet = pets.find((p) => p.id === selectedPetId);
    if (!pet) {
      setHasErrors(true);
      return;
    }
    setHasErrors(false);
    await onComplete({
      ...pet,
    });
  }, [pets, selectedPetId, onComplete]);

  useEffect(() => {
    registerSubmit(handleComplete);
    return () => registerSubmit(null);
  }, [handleComplete, registerSubmit]);

  return (
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
      {loading && <ActivityIndicator size="large" />}
      {user && (
        <HelperText
          type="error"
          visible={hasErrors && !selectedPetId}
          style={styles.helperText}
          padding="none"
        >
          {t("pleaseSelectAPet", "Please select a pet!")}
        </HelperText>
      )}
      {user && !pets.length && !loading && (
        <View style={styles.noPetContainer}>
          <Text>{t("noPetsFound", "No pets found.")}</Text>
          <Button
            mode="contained"
            onPress={() => router.navigate("/(app)/pets/new")}
            style={{ marginTop: 16 }}
          >
            {t("addANewPet", "Add a new pet", { ns: "petprofile" })}
          </Button>
        </View>
      )}
      <PetSelection
        selectedPetId={selectedPetId}
        setSelectedPetId={setSelectedPetId}
        pets={pets}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 12, flexGrow: 1 },
  helperText: { alignSelf: "flex-end", fontWeight: "bold" },
  button: { width: "100%", marginBottom: 16, borderWidth: 1, borderRadius: 12 },
  noPetContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
