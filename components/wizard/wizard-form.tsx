import { FunctionsHttpError } from "@supabase/supabase-js";
import { useRouter } from "expo-router";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { Keyboard, KeyboardAvoidingView, StyleSheet, View } from "react-native";
import { showMessage } from "react-native-flash-message";
import { Button } from "react-native-paper";
import { AnalysisResponse } from "../analyzer/types";
import { usePetAnalyzer } from "../analyzer/use-pet-image-analyzer";
import useUploadPetImageUrl from "../image-upload-handler";
import { useAIFeatureContext } from "../Provider/ai-context-provider";
import { AuthContext } from "../Provider/auth-provider";
import { AddContact } from "./add-contact";
import { AddTime } from "./add-time";
import { ChoosePet } from "./choose-pet";
import { EditPet } from "./edit-pet";
import { LocatePet } from "./locate-pet";
import { Step1 } from "./start";
import { saveNewSighting, saveSightingPhoto } from "./submit-handler";
import { UploadPhoto } from "./upload-photo";
import { defaultSightingFormData, validate } from "./util";
import { SightingReport } from "./wizard-interface";
import { MAX_FILE_SIZE_ERROR, NO_PETS_DETECTED } from "../constants";
import { log } from "../logs";

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
  errorMessage?: string;
  onResetErrorMessage?: () => void;
  onResetAiGeneratedPhoto?: () => void;
};

export const WizardForm = () => {
  const router = useRouter();
  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [disabledNext, setDisabledNext] = useState(false);
  const [disabledBack, setDisabledBack] = useState(false);
  const [currentStep, setCurrentStep] = useState<SightingWizardSteps>("start");
  const [errorMessage, setErrorMessage] = useState("");
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
    setErrorMessage("");
  }, [reportType]);

  const handleBack = useCallback(() => {
    const newHistory = stepHistory.slice(0, stepHistory.length - 1);
    const prevStep = stepHistory[stepHistory.length - 1];
    setStepHistory(newHistory);

    if (prevStep) {
      setCurrentStep(prevStep);
      setErrorMessage("");
    }
  }, [stepHistory]);

  const uploadImage = useUploadPetImageUrl();

  const processResponse = async () => {
    switch (currentStep) {
      case "upload_photo":
        if (sightingFormData.image.uri && isAiFeatureEnabled && !aiGenerated) {
          return analyze(
            sightingFormData.image.uri,
            sightingFormData.image.filename,
            sightingFormData.image.filetype,
          );
        }

        return Promise.resolve();
      case "submit":
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

  const handleNext = () => {
    setErrorMessage("");
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
      .then(() => {
        setLoading(false);

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
      .catch(async (err) => {
        console.log("err", err);
        if (currentStep === "upload_photo") {
          await onImageAnalyzeFailure(err);
        } else if (currentStep === "submit") {
          showMessage({
            message: "Error saving sighting info. Please try again.",
            type: "warning",
            icon: "warning",
            statusBarHeight: 50,
          });
        }
      })
      .finally(() => {
        setLoading(false);
        setDisabledNext(false);
        setDisabledBack(false);
      });
  };

  // Update form data
  const updateSightingData = useCallback((field: string, value: string) => {
    setSightingFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

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

        if (petInfo.colors && petInfo.colors.length > 0) {
          updateSightingData("colors", petInfo.colors.join(", "));
        }

        if (
          petInfo.distinctive_features &&
          petInfo.distinctive_features.length > 0
        ) {
          updateSightingData(
            "features",
            petInfo.distinctive_features.join(", "),
          );
        }

        if (
          petInfo.collar_descriptions &&
          petInfo.collar_descriptions.length > 0
        ) {
          updateSightingData(
            "collarDescription",
            petInfo.collar_descriptions.join(",\n"),
          );
          updateSightingData("collar", "yes_collar");
        }

        if (petInfo.size) {
          updateSightingData("size", petInfo.size);
        }
      } else if (data && "note" in data && data.note) {
        throw new Error(data.note, { cause: "NO_PETS_DETECTED" });
      }
    },
    [updateSightingData],
  );

  const onImageAnalyzeFailure = async (error: any) => {
    if (error instanceof FunctionsHttpError) {
      const errorContext = await error.context.json();
      if (errorContext.code === MAX_FILE_SIZE_ERROR) {
        setErrorMessage("Photo is too large");
      }
      log(errorContext.message);
    } else if (error instanceof Error) {
      if (error.cause === NO_PETS_DETECTED) {
        setErrorMessage("No pets detected in image");
      } else if (error.cause === MAX_FILE_SIZE_ERROR) {
        setErrorMessage("Photo is too large");
      }

      log(error.message);
    } else {
      setErrorMessage("Failed to process image");
      log("Failed to process image");
    }

    setAiGenerated(false);
    setLoading(false);
  };

  const { analyze } = usePetAnalyzer({
    onSuccess: onImageAnalyzeSuccess,
  });

  const onResetErrorMessage = () => {
    setErrorMessage("");
    setIsValidData(true);
  };

  const onResetAiGeneratedPhoto = () => {
    setAiGenerated(false);
  };

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
            errorMessage={errorMessage}
            onResetErrorMessage={onResetErrorMessage}
            onResetAiGeneratedPhoto={onResetAiGeneratedPhoto}
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
    errorMessage,
    onResetErrorMessage,
    onResetAiGeneratedPhoto,
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
          disabled={disabledNext || loading || !!errorMessage}
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
