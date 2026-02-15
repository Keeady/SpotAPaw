import { isFuture } from "date-fns";
import { SightingReportType } from "./wizard-form";
import { SightingReport } from "./wizard-interface";
import { CountryCode, isValidPhoneNumber } from "libphonenumber-js";

export const validate = (
  currentStep: string,
  sightingFormData: SightingReport,
  reportType?: SightingReportType,
) => {
  let isValid = false;
  switch (currentStep) {
    case "start":
      isValid = !!reportType && validateStart(reportType);
      break;
    case "choose_pet":
      isValid = validateChoosePet(sightingFormData);
      break;
    case "upload_photo":
      isValid = validateEditPhoto(sightingFormData);
      break;
    case "edit_pet":
      isValid = validateEditPet(sightingFormData, reportType);
      break;
    case "locate_pet":
      isValid = validateLocatePet(sightingFormData);
      break;
    case "add_time":
      isValid = validateLastSeen(sightingFormData);
      break;
    case "submit":
      isValid = isValidPhoneNumber(
        sightingFormData.contactPhone,
        sightingFormData.contactPhoneCountryCode as CountryCode,
      );
      break;
    default:
      isValid = true;
  }

  return isValid;
};

export function validateEditPet(
  sightingFormData: SightingReport,
  reportType?: SightingReportType,
) {
  let isValid = false;
  if (sightingFormData.species && sightingFormData.colors) {
    isValid = true;
  }

  if (
    reportType === "lost_own" &&
    sightingFormData.age &&
    sightingFormData.colors &&
    sightingFormData.gender &&
    sightingFormData.name &&
    sightingFormData.size
  ) {
    isValid = true;
  }
  return isValid;
}

export function validateEditPhoto(sightingFormData: SightingReport) {
  let isValid = false;
  if (sightingFormData.photoUrl || sightingFormData.photo) {
    isValid = true;
  }

  return isValid;
}

export function validateChoosePet(sightingFormData: SightingReport) {
  let isValid = false;
  if (sightingFormData.id) {
    isValid = true;
  }

  return isValid;
}

export function validateStart(reportType: SightingReportType) {
  let isValid = false;
  if (reportType) {
    isValid = true;
  }

  return isValid;
}

export function validateLocatePet(sightingFormData: SightingReport) {
  let isValid = false;
  if (sightingFormData.last_seen_long && sightingFormData.last_seen_lat) {
    isValid = true;
  }

  return isValid;
}

export function validateLastSeen(sightingFormData: SightingReport) {
  let isValid = false;
  if (
    sightingFormData.last_seen_time &&
    !isFuture(sightingFormData.last_seen_time)
  ) {
    isValid = true;
  }

  return isValid;
}
