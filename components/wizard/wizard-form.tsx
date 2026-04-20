import { FunctionsHttpError, PostgrestError } from "@supabase/supabase-js";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
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
import {
  createSightingFromPet,
  saveNewSighting,
  saveSightingPhoto,
  updateSighting,
} from "./sighting-submit-handler";
import { UploadPhoto } from "./upload-photo";
import { defaultSightingFormData, validate } from "./util";
import {
  PetImage,
  SightingReport,
  SightingReportType,
  SightingWizardSteps,
  WizardFormAction,
  WizardFormProps,
} from "./wizard-interface";
import { MAX_FILE_SIZE_ERROR, NO_PETS_DETECTED } from "../constants";
import { log } from "../logs";
import { createErrorLogMessage, isValidUuid } from "../util";
import { EditPetContinued } from "./edit-pet-continued";
import { SightingRepository } from "@/db/repositories/sighting-repository";
import {
  saveNewPet,
  saveNewPetPhoto,
  updateNewPetPhoto,
  updatePet,
} from "./pet-submit-handler";
import { PetRepository } from "@/db/repositories/pet-repository";
import ShowProgress from "./show-progress";

export const WizardForm = ({ action }: WizardFormProps) => {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const isMountedRef = useRef(true);

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

  const {
    id: sightingId,
    petId,
    is_lost: isPetLost,
  } = useLocalSearchParams<{
    id: string;
    petId: string;
    is_lost: string;
    linkedSightingId: string;
  }>();

  const updateSightingData = useCallback(
    (
      field: keyof SightingReport,
      value: string | number | PetImage | boolean,
    ) => {
      setSightingFormData((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    // reset data
    setSightingFormData(defaultSightingFormData);
    setIsValidData(true);
    setErrorMessage("");
  }, [reportType]);

  useEffect(() => {
    if (sightingId && isValidUuid(sightingId)) {
      setCurrentStep("upload_photo");
      updateSightingData("sightingId", sightingId);

      const repository = new SightingRepository();
      repository
        .getSighting(sightingId)
        .then((data) => {
          if (!isMountedRef.current) {
            return;
          }

          if (!data) {
            return;
          }

          const sighting = data;

          if (action === "edit-sighting") {
            updateSightingData("lastSeenLong", sighting.lastSeenLong);
            updateSightingData("lastSeenLat", sighting.lastSeenLat);
            updateSightingData("lastSeenLocation", sighting.lastSeenLocation);
            updateSightingData("lastSeenTime", sighting.lastSeenTime);
            updateSightingData("features", sighting.features);
            updateSightingData("photo", sighting.photo);
            updateSightingData("note", sighting.note);
            updateSightingData("collarDescription", sighting.collarDescription);
          }

          if (sighting.petId) {
            updateSightingData("id", sighting.petId);
          }
          updateSightingData("species", sighting.species);
          updateSightingData("name", sighting.name);
          updateSightingData("breed", sighting.breed);
          updateSightingData("colors", sighting.colors);
          updateSightingData("size", sighting.size);
          updateSightingData("gender", sighting.gender);
          if (sighting.linkedSightingId) {
            updateSightingData("linkedSightingId", sighting.linkedSightingId);
          }

          if (sighting.petDescriptionId) {
            updateSightingData("petDescriptionId", sighting.petDescriptionId);
          }

        })
        .catch((error) => {
          const errorMessage = createErrorLogMessage(error);
          log(
            `Wizard: Failed to fetch sighting info for sighting: ${errorMessage}`,
          );
          showMessage({
            message: "Error fetching pet sighting.",
            type: "warning",
            icon: "warning",
            statusBarHeight: 50,
          });
        });
    }
  }, [sightingId, updateSightingData, action]);

  useEffect(() => {
    if (action === "add-pet") {
      setCurrentStep("upload_photo");
      setReportType("new_pet");
    } else if (action === "edit-pet") {
      setCurrentStep("upload_photo");
      setReportType("edit_pet");
    }
  }, [action]);

  useEffect(() => {
    if (petId && isValidUuid(petId)) {
      updateSightingData("id", petId);

      const repository = new PetRepository();
      repository
        .getPet(petId)
        .then((data) => {
          if (!isMountedRef.current) {
            return;
          }

          if (!data) {
            return;
          }

          const pet = data;
          updateSightingData("species", pet.species);
          updateSightingData("age", pet.age);
          updateSightingData("name", pet.name);
          updateSightingData("breed", pet.breed);
          updateSightingData("colors", pet.colors);
          updateSightingData("gender", pet.gender);
          updateSightingData("features", pet.features);
          updateSightingData("note", pet.note);
          updateSightingData("photo", pet.photo);
          updateSightingData("isLost", pet.isLost || Boolean(isPetLost));
          updateSightingData("id", pet.id);
        })
        .catch((error) => {
          const errorMessage = createErrorLogMessage(error);
          log(`Wizard: Failed to fetch pet info for pet: ${errorMessage}`);
          showMessage({
            message: "Error fetching pet information.",
            type: "warning",
            icon: "warning",
            statusBarHeight: 50,
          });
        });
    }
  }, [petId, updateSightingData, isPetLost]);

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
          if (action === "new-sighting") {
            return saveNewSighting("", sightingFormData);
          } else if (action === "edit-sighting") {
            return updateSighting("", sightingFormData);
          } else if (action === "add-pet") {
            if (sightingFormData.isLost) {
              return saveNewPet(
                "",
                sightingFormData,
                user?.id || "",
                createSightingFromPet,
              );
            }

            return saveNewPet("", sightingFormData, user?.id || "");
          } else if (action === "edit-pet") {
            if (sightingFormData.isLost) {
              return updatePet("", sightingFormData, createSightingFromPet);
            }

            return updatePet("", sightingFormData);
          }
        } else {
          if (action === "new-sighting" || action === "edit-sighting") {
            return saveSightingPhoto(sightingFormData, uploadImage, action);
          } else if (action === "add-pet") {
            if (sightingFormData.isLost) {
              return saveNewPetPhoto(
                sightingFormData,
                uploadImage,
                user?.id || "",
                createSightingFromPet,
              );
            }

            return saveNewPetPhoto(
              sightingFormData,
              uploadImage,
              user?.id || "",
            );
          } else if (action === "edit-pet") {
            if (sightingFormData.isLost) {
              return updateNewPetPhoto(
                sightingFormData,
                uploadImage,
                createSightingFromPet,
              );
            }

            return updateNewPetPhoto(sightingFormData, uploadImage);
          }
        }
      case "find_match":
        return router.push(`/${sightingsRoute}`);
      default:
        return Promise.resolve();
    }
  };

  const getNextStep = useCallback(() => {
    if (action === "add-pet" || action === "edit-pet") {
      if (currentStep === "start") {
        return "upload_photo";
      } else if (currentStep === "upload_photo") {
        return "edit_pet";
      } else if (currentStep === "edit_pet") {
        return "edit_pet_continued";
      } else if (
        currentStep === "edit_pet_continued" &&
        sightingFormData.isLost
      ) {
        return "locate_pet";
      } else if (currentStep === "locate_pet" && sightingFormData.isLost) {
        return "add_time";
      }

      return "submit";
    }

    if (sightingId && isValidUuid(sightingId)) {
      if (currentStep === "start") {
        return "upload_photo";
      } else if (currentStep === "upload_photo") {
        return "edit_pet";
      } else if (currentStep === "edit_pet") {
        return "edit_pet_continued";
      } else if (currentStep === "edit_pet_continued") {
        return "locate_pet";
      } else if (currentStep === "locate_pet") {
        return "add_time";
      } else if (currentStep === "add_time") {
        return "submit";
      }

      return "find_match";
    }

    if (currentStep === "start" && reportType === "lost_own") {
      return "choose_pet";
    } else if (currentStep === "start" || currentStep === "choose_pet") {
      return "upload_photo";
    } else if (currentStep === "upload_photo") {
      return "edit_pet";
    } else if (currentStep === "edit_pet") {
      return "edit_pet_continued";
    } else if (currentStep === "edit_pet_continued") {
      return "locate_pet";
    } else if (currentStep === "locate_pet") {
      return "add_time";
    } else if (currentStep === "add_time") {
      return "submit";
    }

    return "find_match";
  }, [currentStep, reportType, sightingId, sightingFormData.isLost, action]);

  const handleNext = () => {
    setErrorMessage("");
    setDisabledNext(true);
    setDisabledBack(true);
    setLoading(true);

    const isValid = validate(sightingFormData, currentStep, reportType);
    setIsValidData(isValid);

    if (!isValid) {
      setDisabledNext(false);
      setDisabledBack(false);
      setLoading(false);
      return;
    }

    processResponse()
      .then(() => {
        if (!isMountedRef.current) {
          return;
        }

        setLoading(false);

        if (currentStep && currentStep !== "submit") {
          const nextStep = getNextStep();

          if (nextStep) {
            setStepHistory([...stepHistory, currentStep]);
            setCurrentStep(nextStep);
          }
        } else if (currentStep === "submit" && action === "new-sighting") {
          showMessage({
            message: "Successfully added pet sighting.",
            type: "success",
            icon: "success",
            statusBarHeight: 50,
          });

          setCurrentStep("find_match");
        } else if (currentStep === "submit" && action === "edit-sighting") {
          showMessage({
            message: "Successfully updated pet sighting.",
            type: "success",
            icon: "success",
            statusBarHeight: 50,
          });
          setCurrentStep("find_match");
        } else if (currentStep === "submit" && action === "add-pet") {
          showMessage({
            message: "Successfully added pet profile.",
            type: "success",
            icon: "success",
            statusBarHeight: 50,
          });

          router.replace(`/(app)/pets`);
        } else if (currentStep === "submit" && action === "edit-pet") {
          showMessage({
            message: "Successfully updated pet profile.",
            type: "success",
            icon: "success",
            statusBarHeight: 50,
          });

          router.replace(`/(app)/pets`);
        }
      })
      .catch(async (err) => {
        if (!isMountedRef.current) {
          return;
        }

        if (currentStep === "upload_photo") {
          await onImageAnalyzeFailure(err);
        } else if (currentStep === "submit") {
          onSubmitFailure(err, action);
        }
      })
      .finally(() => {
        if (!isMountedRef.current) {
          return;
        }

        setLoading(false);
        setDisabledNext(false);
        setDisabledBack(false);
      });
  };

  const onImageAnalyzeSuccess = useCallback(
    (
      data?: AnalysisResponse,
      publicUrl?: string,
      petDescriptionId?: string,
    ) => {
      if (!isMountedRef.current) {
        return;
      }

      if (publicUrl) {
        updateSightingData("photo", publicUrl);
      }

      if (petDescriptionId) {
        updateSightingData("petDescriptionId", petDescriptionId);
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
        setErrorMessage("Photo is too large.");
      } else {
        setErrorMessage("Failed to process image. Please try again.");
      }

      log(errorContext.message);
    } else if (error instanceof Error) {
      if (error.cause === NO_PETS_DETECTED) {
        setErrorMessage("No pets detected in image.");
      } else if (error.cause === MAX_FILE_SIZE_ERROR) {
        setErrorMessage("Photo is too large.");
      } else {
        setErrorMessage("Failed to process image. Please try again.");
      }

      log(error.message);
    } else {
      const errorMessage = createErrorLogMessage(error);
      setErrorMessage("Failed to process image. Please try again.");
      log(`Wizard: Failed to process image: ${errorMessage}`);
    }

    setAiGenerated(false);
    setLoading(false);
  };

  const onSubmitFailure = (error: any, action: WizardFormAction) => {
    if (error instanceof PostgrestError) {
      log(error.message);
    } else {
      const errorMessage = createErrorLogMessage(error);
      log(`Wizard: Failed to submit sighting: ${errorMessage}`);
    }

    if (action === "add-pet" || action === "edit-pet") {
      showMessage({
        message: "Error saving pet profile. Please try again.",
        type: "warning",
        icon: "warning",
        statusBarHeight: 50,
      });
    } else {
      showMessage({
        message: "Error saving sighting info. Please try again.",
        type: "warning",
        icon: "warning",
        statusBarHeight: 50,
      });
    }
  };

  const { analyze } = usePetAnalyzer({
    onSuccess: onImageAnalyzeSuccess,
  });

  const onResetErrorMessage = useCallback(() => {
    setErrorMessage("");
    setIsValidData(true);
  }, []);

  const onResetAiGeneratedPhoto = useCallback(() => {
    setAiGenerated(false);
  }, []);

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
            reportType={reportType}
          />
        );
      case "edit_pet_continued":
        return (
          <EditPetContinued
            sightingFormData={sightingFormData}
            updateSightingData={updateSightingData}
            loading={loading}
            setReportType={setReportType}
            aiGenerated={aiGenerated}
            isValidData={isValidData}
            reportType={reportType}
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
      case "find_match":
        return (
          <ShowProgress
            sightingFormData={sightingFormData}
            updateSightingData={updateSightingData}
            loading={loading}
            setReportType={setReportType}
            isValidData={isValidData}
            reportType={reportType}
            aiGenerated={aiGenerated}
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
    updateSightingData,
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

  const getSubmitButtonText = (
    currentStep: SightingWizardSteps,
    action: WizardFormAction,
  ) => {
    if (action === "add-pet") {
      return currentStep === "submit" ? "Add Pet" : "Continue";
    } else if (action === "edit-pet") {
      return currentStep === "submit" ? "Update Pet" : "Continue";
    }

    if (currentStep === "find_match") {
      return "Done";
    }

    return currentStep === "submit" ? "Submit" : "Continue";
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={behavior}
      keyboardVerticalOffset={100}
    >
      <View style={styles.content}>{renderStep()}</View>
      {currentStep !== "find_match" && (
        <View style={styles.buttonContainer}>
          <Button
            mode="text"
            onPress={handleBack}
            disabled={loading || disabledBack || stepHistory.length === 0}
          >
            Back
          </Button>
          <Button
            mode={currentStep === "submit" ? "contained" : "text"}
            onPress={handleNext}
            disabled={disabledNext || loading || !!errorMessage}
            style={user ? {} : { marginBottom: 20 }}
          >
            {getSubmitButtonText(currentStep, action)}
          </Button>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 16,
  },
});
