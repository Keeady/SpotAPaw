import type { PetImage, SightingPet, SightingReportType } from "../wizard/wizard-interface";

/** Every step id the wizard knows how to render. Add new ids here and in wizard-renderers.tsx. */
export type WizardStepId =
  | "start"
  | "choose_pet"
  | "upload_photo"
  | "edit_pet"
  | "edit_pet_continued"
  | "last_seen"
  | "add_contact";

export type SightingFormData = Partial<SightingPet> & {
  reportType?: SightingReportType;
  /** Newly picked/taken photos (local uris). `photos` holds already-saved ones. */
  images?: PetImage[];
  /** True when fields were filled in by AI photo analysis (shows the AI banner). */
  aiGenerated?: boolean;
  // Fields collected by the edit-pet steps.
  size?: string;
  collar?: string;
  collarDescription?: string;
  petBehavior?: string;
  // Fields collected by the last-seen step.
  lastSeenTime?: string; // ISO string
  lastSeenLat?: number;
  lastSeenLong?: number;
  lastSeenLocation?: string;
  // Fields collected by the add-contact step.
  reporterId?: string;
  reporterName?: string;
  reporterPhone?: string;
  contactPhoneCountryCode?: string;
};

/** One entry in the wizard configuration. */
export type WizardStepConfig = {
  /** Selects which renderer is used (see wizard-renderers.tsx). */
  id: WizardStepId;
  title: string;
  subtitle: string;
  /** Label of the "next" button, e.g. "Continue", "Submit report". */
  nextActionName: (data: SightingFormData) => string;
  /**
   * Return true to skip this step. Evaluated against the latest form data
   * (and against `initialData` for the first step), so any step can be skipped.
   */
  skip?: (data: SightingFormData) => boolean;
  /**
   * Called by the wizard (via the base onComplete) when this step has finished,
   * before moving on. Receives the merged form data. May be async.
   * May return a patch that is merged into the form data (e.g. AI analysis
   * results). If it throws, the wizard stays on the step and shows the error.
   */
  onComplete: (
    data: SightingFormData,
  ) => void | SightingFormData | Promise<void | SightingFormData>;
};

export type WizardConfig = WizardStepConfig[];

/** Props every step renderer receives. */
export type WizardScreenProps = {
  config: WizardStepConfig;
  formData: SightingFormData;
  /** True while the base onComplete is running (disable inputs). */
  loading: boolean;
  /** Message from the last failed step onComplete, if any. */
  errorMessage?: string;
  clearError: () => void;
  /** Merge a patch into the form data without leaving the step. */
  updateFormData: (patch: SightingFormData) => void;
  /**
   * Base onComplete from the wizard. A screen calls this from its OWN
   * onComplete once its data is valid. Optional patch is merged into form data.
   */
  onComplete: (patch?: SightingFormData) => Promise<void>;
  /**
   * The wizard's footer button triggers whatever the screen registers here,
   * so each screen decides when it is actually ready to move on.
   */
  registerSubmit: (fn: (() => void | Promise<void>) | null) => void;
};

export type WizardScreenComponent = (props: WizardScreenProps) => React.JSX.Element;
