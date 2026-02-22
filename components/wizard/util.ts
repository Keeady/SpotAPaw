import { isFuture } from "date-fns";
import { SightingReportType } from "./wizard-form";
import { SightingReport } from "./wizard-interface";
import { CountryCode, isValidPhoneNumber } from "libphonenumber-js";

export const defaultSightingFormData = {
  id: "",
  species: "",
  age: "",
  name: "",
  breed: "",
  colors: "",
  size: "",
  last_seen_long: 0,
  last_seen_lat: 0,
  last_seen_location: "",
  last_seen_time: "",
  features: "",
  photo: "",
  contactName: "",
  contactPhone: "",
  contactPhoneCountryCode: "US",
  petBehavior: "",
  gender: "",
  note: "",
  linkedSightingId: "",
  photoUrl: "",
  is_lost: false,
  aiMessage: "",
  collar: "no",
  collarDescription: "",
  image: {},
} as SightingReport;

export const validate = (
  sightingFormData: SightingReport,
  currentStep?: string,
  reportType?: SightingReportType,
) => {
  let isValid = false;
  if (!currentStep) {
    return isValid;
  }

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
    case "edit_pet_continued":
      isValid = validateEditPetContinued(sightingFormData, reportType);
      break;
    case "locate_pet":
      isValid = validateLocatePet(sightingFormData);
      break;
    case "add_time":
      isValid = validateLastSeen(sightingFormData);
      break;
    case "submit":
      isValid = validateAddContact(sightingFormData);
      break;
    default:
      isValid = true;
  }

  return isValid;
};

function validateAddContact(sightingFormData: SightingReport) {
  let isValid = false;
  if (!sightingFormData.contactPhone) {
    isValid = true;
  } else {
    isValid = isValidPhoneNumber(
      sightingFormData.contactPhone,
      sightingFormData.contactPhoneCountryCode as CountryCode,
    );
  }
  return isValid;
}

export function validateEditPet(
  sightingFormData: SightingReport,
  reportType?: SightingReportType,
) {
  let isValid = true;
  if (sightingFormData.linkedSightingId) {
    return isValid;
  }

  if (!sightingFormData.species || !sightingFormData.colors) {
    isValid = false;
  }

  if (
    reportType === "lost_own" &&
    (!sightingFormData.age ||
      !sightingFormData.colors ||
      !sightingFormData.gender ||
      !sightingFormData.name)
  ) {
    isValid = false;
  }

  return isValid;
}

export function validateEditPetContinued(
  sightingFormData: SightingReport,
  reportType?: SightingReportType,
) {
  let isValid = true;
  if (sightingFormData.linkedSightingId) {
    return isValid;
  }

  if (reportType === "lost_own" && !sightingFormData.size) {
    isValid = false;
  }

  if (
    sightingFormData.collar === "yes_collar" &&
    !sightingFormData.collarDescription
  ) {
    isValid = false;
  }

  return isValid;
}

export function validateEditPhoto(sightingFormData: SightingReport) {
  let isValid = false;
  if (sightingFormData.image.uri || sightingFormData.photo) {
    isValid = true;
  } else if (sightingFormData.linkedSightingId) {
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
