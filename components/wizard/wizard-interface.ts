import { Pet } from "@/db/models/pet";
import { AggregatedSighting } from "@/db/models/sighting";
import { ConfidenceLevel } from "../analyzer/types";

export type WizardFormAction =
  | "edit-sighting"
  | "new-sighting"
  | "add-pet"
  | "edit-pet";
  
export type SightingPet = Pet & {
  photoUrl?: string;
  image?: PetImage;
  images?: PetImage[];
};

export type SightingReport = AggregatedSighting & {
  contactPhoneCountryCode: string;
  collarDescription: string;
  aiMessage: string;
  image: PetImage;
  collar: "yes_collar" | "no";
  petBehavior: string;
  isLost: boolean;
  sightingId: string;
  images: PetImage[];
  deletedAt: string;
  narrative: string;
  confidence: ConfidenceLevel;
  note: string;
  aiGenerated: boolean;
};

export type PetImage = {
  uri: string;
  filename: string;
  filetype: string;
};

export type SightingWizardSteps =
  | "start"
  | "upload_photo"
  | "photo_result"
  | "choose_pet"
  | "edit_pet"
  | "edit_pet_continued"
  | "locate_pet"
  | "add_time"
  | "find_match"
  | "submit";

export type SightingReportType =
  | "lost_own"
  | "found_stray"
  | "new_pet"
  | "edit_pet";

export type SightingWizardStepData = {
  sightingFormData: SightingReport;
  updateSightingData: (
    field: keyof SightingReport,
    value: string | number | PetImage | boolean | PetImage[] | string[],
  ) => void;
  loading: boolean;
  setReportType: (type: SightingReportType) => void;
  reportType?: SightingReportType;
  aiGenerated?: boolean;
  isValidData?: boolean;
  errorMessage?: string;
  onResetErrorMessage?: () => void;
  onResetAiGeneratedPhoto?: () => void;
};

export type WizardFormProps = {
  action: WizardFormAction;
};
