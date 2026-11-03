import { StartStep } from "./steps/step-start";
import { ChoosePetStep } from "./steps/step-choose-pet";
import type { WizardScreenComponent, WizardStepId } from "./wizard-types";
import { UploadPhotoStep } from "./steps/step-upload-photo";
import { EditPetStep } from "./steps/step-edit-pet";
import { EditPetContinuedStep } from "./steps/step-edit-pet-continued";
import { AddContactStep } from "./steps/step-add-contact";
import { LastSeenStep } from "./steps/step-last-seen";

/**
 * Maps a step config `id` to the component that renders it.
 * Adding a step = add an id to WizardStepId, build the screen, register it here.
 */
export const wizardRenderers: Record<WizardStepId, WizardScreenComponent> = {
  start: StartStep,
  choose_pet: ChoosePetStep,
  upload_photo: UploadPhotoStep,
  edit_pet: EditPetStep,
  edit_pet_continued: EditPetContinuedStep,
  last_seen: LastSeenStep,
  add_contact: AddContactStep
};
