import { isFuture } from "date-fns";
import { SightingReportType } from "./wizard-form";
import { SightingReport } from "./wizard-interface";
import { CountryCode, isValidPhoneNumber } from "libphonenumber-js";
import { isValidUuid } from "../util";

export const defaultSightingFormData = {
  id: "", // pet id
  species: "",
  age: 0,
  name: "",
  breed: "",
  colors: "",
  size: "",
  lastSeenLong: 0,
  lastSeenLat: 0,
  lastSeenLocation: "",
  lastSeenTime: new Date().toISOString(),
  features: "",
  photo: "",
  reporterName: "",
  reporterPhone: "",
  contactPhoneCountryCode: "US",
  petBehavior: "",
  gender: "",
  note: "",
  sightingId: "", // aggregate sighting id
  linkedSightingId: "", // aggregate linked sighting id
  photoUrl: "",
  isLost: false,
  aiMessage: "",
  collar: "no",
  collarDescription: "",
  image: { uri: "", filename: "", filetype: "" },
  updatedAt: "",
  ownerId: "",
  linkedSightings: [],
  createdAt: "",
  petId: "", // pet id
  isActive: true,
  reporterId: "",
  petDescriptionId: "",
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
  if (!sightingFormData.reporterPhone) {
    isValid = true;
  } else {
    isValid = isValidPhoneNumber(
      sightingFormData.reporterPhone,
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
    (reportType === "lost_own" ||
      reportType === "new_pet" ||
      reportType === "edit_pet") &&
    (!sightingFormData.age ||
      !sightingFormData.gender ||
      !sightingFormData.name)
  ) {
    isValid = false;
  }

  if (
    (reportType === "new_pet" || reportType === "edit_pet") &&
    !sightingFormData.breed
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

  if (
    (reportType === "lost_own" ||
      reportType === "new_pet" ||
      reportType === "edit_pet") &&
    !sightingFormData.size
  ) {
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
  if (sightingFormData.id && isValidUuid(sightingFormData.id)) {
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
  if (sightingFormData.lastSeenLong && sightingFormData.lastSeenLat) {
    isValid = true;
  }

  return isValid;
}

export function validateLastSeen(sightingFormData: SightingReport) {
  let isValid = false;
  if (
    sightingFormData.lastSeenTime &&
    !isFuture(sightingFormData.lastSeenTime)
  ) {
    isValid = true;
  }

  return isValid;
}
