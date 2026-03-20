import { getLastSeenLocation, isValidUuid } from "../util";
import { SightingReport } from "./wizard-interface";
import { SightingRepository } from "@/db/repositories/sighting-repository";

export type WizardFormAction = "edit" | "new";

export async function saveSightingPhoto(
  sightingFormData: SightingReport,
  uploadImage: (
    uri: string,
    callback: (uri: string, error?: string) => void,
  ) => Promise<void>,
  action: WizardFormAction,
) {
  if (sightingFormData.image.uri) {
    await uploadImage(sightingFormData.image.uri, (photo: string) =>
      action === "new"
        ? saveNewSighting(photo, sightingFormData)
        : updateSighting(photo, sightingFormData),
    );
  } else {
    if (action === "new") {
      await saveNewSighting("", sightingFormData);
    } else {
      await updateSighting("", sightingFormData);
    }
  }
}

export async function saveNewSighting(
  photo: string,
  sightingFormData: SightingReport,
) {
  const payload = await buildSightingPayload(photo, sightingFormData);

  const repository = new SightingRepository();
  return await repository.createSighting(payload);
}

export async function updateSighting(
  photo: string,
  sightingFormData: SightingReport,
) {
  if (
    !sightingFormData.linkedSightingId ||
    !isValidUuid(sightingFormData.linkedSightingId)
  ) {
    throw new Error("Missing or invalid linked sighting id");
  }

  const payload = await buildSightingPayload(photo, sightingFormData);
  const sightingRepository = new SightingRepository();
  return await sightingRepository.updateSighting(sightingFormData.linkedSightingId, payload);
}

function saveNotes(report: SightingReport) {
  let notes = `${report.note}\n` || "";

  if (report.petBehavior) {
    notes = notes.concat(`Pet behavior: ${report.petBehavior}`);
  }

  return notes;
}

async function buildSightingPayload(
  photo: string,
  sightingFormData: SightingReport,
) {
  const lastSeenFormatted = await getLastSeenLocation(
    sightingFormData.lastSeenLocation,
    sightingFormData.lastSeenLat,
    sightingFormData.lastSeenLong,
  );
  const payload = {
    age: sightingFormData.age ? sightingFormData.age : null,
    name: sightingFormData.name,
    colors: sightingFormData.colors,
    breed: sightingFormData.breed,
    size: sightingFormData.size,
    species: sightingFormData.species,
    gender: sightingFormData.gender,
    features: sightingFormData.features,
    collarDescription: sightingFormData.collarDescription,
    photo: photo ? photo : sightingFormData.photo,
    note: saveNotes(sightingFormData),
    lastSeenLocation: lastSeenFormatted,
    lastSeenLong: sightingFormData.lastSeenLong,
    lastSeenLat: sightingFormData.lastSeenLat,
    lastSeenTime: sightingFormData.lastSeenTime,
    reporterName: sightingFormData.reporterName,
    reporterPhone: sightingFormData.reporterPhone,
  } as any;

  if (sightingFormData.id && isValidUuid(sightingFormData.id)) {
    payload.petId = sightingFormData.id;
  }

  if (
    sightingFormData.linkedSightingId &&
    isValidUuid(sightingFormData.linkedSightingId)
  ) {
    payload.linkedSightingId = sightingFormData.linkedSightingId;
  }

  if (sightingFormData.reporterId && isValidUuid(sightingFormData.reporterId)) {
    payload.reporterId = sightingFormData.reporterId;
  }

  return payload;
}
