import React, { useCallback, useContext, useEffect, useState } from "react";
import { View, StyleSheet, KeyboardAvoidingView, Keyboard } from "react-native";
import { Button } from "react-native-paper";
import { UploadPhoto } from "./upload-photo";
import { usePetAnalyzer } from "../analyzer/use-pet-image-analyzer";
import { log } from "../logs";
import { AnalysisResponse } from "../analyzer/types";
import { Step1 } from "./start";
import { SightingReport } from "./wizard-interface";
import { ChoosePet } from "./choose-pet";
import { EditPet } from "./edit-pet";
import { useAIFeatureContext } from "../Provider/ai-context-provider";
import { LocatePet } from "./locate-pet";
import { defaultSightingFormData, validate } from "./util";
import { AddTime } from "./add-time";
import { AddContact } from "./add-contact";
import useUploadPetImageUrl from "../image-upload";
import { saveNewSighting, saveSightingPhoto } from "./submit-handler";
import { showMessage } from "react-native-flash-message";
import { useRouter } from "expo-router";
import { AuthContext } from "../Provider/auth-provider";
import { createErrorLogMessage } from "../util";

export type SightingWizardSteps =
  | "start"
  | "upload_photo"
  | "choose_pet"
  | "edit_pet"
  | "locate_pet"
  | "add_time"
  | "submit";

export type SightingReportType = "lost_own" | "found_stray";

export type SightingWizardStepData = {
  sightingFormData: SightingReport;
  updateSightingData: (field: string, value: string) => void;
  loading: boolean;
  setReportType: (type: SightingReportType) => void;
  reportType?: SightingReportType;
  aiGenerated?: boolean;
  isValidData?: boolean;
};

export const WizardForm = () => {
  const router = useRouter();
  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [disabledNext, setDisabledNext] = useState(false);
  const [disabledBack, setDisabledBack] = useState(false);
  const [currentStep, setCurrentStep] = useState<SightingWizardSteps>("start");
  const [error, setError] = useState("");
  const { isAiFeatureEnabled } = useAIFeatureContext();
  const [aiGenerated, setAiGenerated] = useState(false);
  const [isValidData, setIsValidData] = useState(true);
  const sightingsRoute = user ? "my-sightings" : "sightings";

  const [stepHistory, setStepHistory] = useState<SightingWizardSteps[]>([]);
  const [behavior, setBehavior] = useState<"padding" | undefined>("padding");

  const [reportType, setReportType] = useState<SightingReportType>();

  const [sightingFormData, setSightingFormData] = useState<SightingReport>(
    defaultSightingFormData,
  );

  useEffect(() => {
    // reset data
    setSightingFormData(defaultSightingFormData);
    setIsValidData(true);
  }, [reportType]);

  const handleBack = useCallback(() => {
    const newHistory = stepHistory.slice(0, stepHistory.length - 1);
    const prevStep = stepHistory[stepHistory.length - 1];
    setStepHistory(newHistory);

    if (prevStep) {
      setCurrentStep(prevStep);
    }
  }, [stepHistory]);

  const uploadImage = useUploadPetImageUrl();

  const processResponse = async () => {
    switch (currentStep) {
      case "upload_photo":
        if (sightingFormData.photoUrl && isAiFeatureEnabled) {
          setLoading(true);
          return analyze(sightingFormData.photoUrl);
        }

        return Promise.resolve();
      case "submit":
        setLoading(true);
        if (isAiFeatureEnabled) {
          return saveNewSighting("", sightingFormData);
        }
        return saveSightingPhoto(sightingFormData, uploadImage);
      default:
        return Promise.resolve();
    }
  };

  const getNextStep = useCallback(() => {
    if (currentStep === "start" && reportType === "lost_own") {
      return "choose_pet";
    } else if (currentStep === "start" || currentStep === "choose_pet") {
      return "upload_photo";
    } else if (currentStep === "upload_photo") {
      return "edit_pet";
    } else if (currentStep === "edit_pet") {
      return "locate_pet";
    } else if (currentStep === "locate_pet") {
      return "add_time";
    }

    return "submit";
  }, [currentStep, reportType]);

  const handleNext = useCallback(() => {
    setDisabledNext(true);
    setDisabledBack(true);
    setLoading(true);

    const isValid = validate(currentStep, sightingFormData, reportType);
    setIsValidData(isValid);

    if (!isValid) {
      setDisabledNext(false);
      setDisabledBack(false);
      setLoading(false);
      return;
    }

    processResponse()
      .then((data) => {
        setLoading(false);
        if (error) {
          showMessage({
            message: "Error saving sighting info. Please try again.",
            type: "warning",
            icon: "warning",
            statusBarHeight: 50,
          });
          return;
        }

        if (currentStep !== "submit") {
          const nextStep = getNextStep();

          if (nextStep) {
            setStepHistory([...stepHistory, currentStep]);
            setCurrentStep(nextStep);
          }
        } else if (currentStep === "submit") {
          showMessage({
            message: "Successfully added pet sighting.",
            type: "success",
            icon: "success",
            statusBarHeight: 50,
          });

          router.dismissTo(`/${sightingsRoute}`);
        }
      })
      .catch((err) => {
        const error = createErrorLogMessage(err);
        log(error);
      })
      .finally(() => {
        setLoading(false);
        setDisabledNext(false);
        setDisabledBack(false);
      });
  }, [
    currentStep,
    error,
    getNextStep,
    processResponse,
    reportType,
    router,
    sightingFormData,
    sightingsRoute,
    stepHistory,
  ]);

  // Update form data
  const updateSightingData = (field: string, value: string) => {
    setSightingFormData((prev) => ({ ...prev, [field]: value }));
  };

  const onImageAnalyzeSuccess = useCallback(
    (data?: AnalysisResponse, publicUrl?: string) => {
      if (publicUrl) {
        updateSightingData("photo", publicUrl);
      }

      if (data && "pets" in data && data.pets.length > 0) {
        setAiGenerated(true);

        const petInfo = data.pets[0];
        if (petInfo.species) {
          updateSightingData("species", petInfo.species);
        }

        if (petInfo.breed) {
          updateSightingData("breed", petInfo.breed);
        }

        if (petInfo.colors) {
          updateSightingData("colors", petInfo.colors.join(", "));
        }

        if (petInfo.distinctive_features) {
          updateSightingData(
            "features",
            petInfo.distinctive_features.join(", "),
          );
        }

        if (petInfo.collar_descriptions) {
          updateSightingData(
            "collarDescription",
            petInfo.collar_descriptions.join(", "),
          );
        }

        if (petInfo.size) {
          updateSightingData("size", petInfo.size);
        }

        // setAiMessage("");
      } else if (data && "note" in data && data.note) {
        setError(data.note);
        setAiGenerated(false);
        updateSightingData("aiMessage", data.note);
      }
    },
    [],
  );

  const { analyze } = usePetAnalyzer({
    onSuccess: onImageAnalyzeSuccess,
    onError: (error: Error) => {
      log(error.message);
      setAiGenerated(false);
    },
  });

  // Render step content
  const renderStep = useCallback(() => {
    switch (currentStep) {
      case "start":
        return (
          <Step1
            sightingFormData={sightingFormData}
            updateSightingData={updateSightingData}
            loading={loading}
            setReportType={setReportType}
            reportType={reportType}
            isValidData={isValidData}
          />
        );
      case "upload_photo":
        return (
          <UploadPhoto
            sightingFormData={sightingFormData}
            updateSightingData={updateSightingData}
            loading={loading}
            setReportType={setReportType}
            isValidData={isValidData}
          />
        );
      case "choose_pet":
        return (
          <ChoosePet
            sightingFormData={sightingFormData}
            updateSightingData={updateSightingData}
            loading={loading}
            setReportType={setReportType}
            isValidData={isValidData}
          />
        );
      case "edit_pet":
        return (
          <EditPet
            sightingFormData={sightingFormData}
            updateSightingData={updateSightingData}
            loading={loading}
            setReportType={setReportType}
            aiGenerated={aiGenerated}
            isValidData={isValidData}
          />
        );
      case "locate_pet":
        return (
          <LocatePet
            sightingFormData={sightingFormData}
            updateSightingData={updateSightingData}
            loading={loading}
            setReportType={setReportType}
            isValidData={isValidData}
          />
        );
      case "add_time":
        return (
          <AddTime
            sightingFormData={sightingFormData}
            updateSightingData={updateSightingData}
            loading={loading}
            setReportType={setReportType}
            isValidData={isValidData}
          />
        );
      case "submit":
        return (
          <AddContact
            sightingFormData={sightingFormData}
            updateSightingData={updateSightingData}
            loading={loading}
            setReportType={setReportType}
            isValidData={isValidData}
            reportType={reportType}
          />
        );
      default:
        return null;
    }
  }, [
    currentStep,
    sightingFormData,
    loading,
    isValidData,
    reportType,
    aiGenerated,
  ]);

  useEffect(() => {
    const showListener = Keyboard.addListener("keyboardDidShow", () => {
      setBehavior("padding");
    });
    const hideListener = Keyboard.addListener("keyboardDidHide", () => {
      setBehavior(undefined);
    });

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={behavior}
      keyboardVerticalOffset={100}
    >
      <View style={styles.content}>{renderStep()}</View>
      <View style={styles.buttonContainer}>
        <Button
          mode="outlined"
          onPress={handleBack}
          disabled={loading || disabledBack || currentStep === "start"}
          style={styles.button}
        >
          Back
        </Button>
        <Button
          mode="contained"
          onPress={handleNext}
          style={styles.button}
          disabled={disabledNext || loading}
        >
          {currentStep === "submit" ? "Submit" : "Continue"}
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 16,
  },
  content: {
    flex: 1,
  },
  card: {
    flex: 1,
  },
  progressContainer: {
    marginBottom: 24,
  },
  stepTitle: {
    marginBottom: 8,
    fontWeight: "bold",
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  stepContent: {
    flex: 1,
    marginBottom: 16,
  },
  stepHeader: {
    marginBottom: 8,
    fontWeight: "bold",
  },
  stepDescription: {
    marginBottom: 24,
    color: "#666",
  },
  input: {
    marginBottom: 4,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    padding: 16,
  },
  button: {
    flex: 1,
  },
});
