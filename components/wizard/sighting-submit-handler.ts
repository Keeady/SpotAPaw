import { AggregatedSighting } from "@/db/models/sighting";
import { getLastSeenLocation, isValidUuid } from "../util";
import { SightingReport } from "./wizard-interface";
import { SightingRepository } from "@/db/repositories/sighting-repository";

export async function createSightingFromPet(
  petId: string,
  sightingFormData: SightingReport,
) {
  if (!sightingFormData.isLost) {
    return;
  }

  return saveNewSighting("", { ...sightingFormData, petId });
}

export async function saveSightingPhoto(
  sightingFormData: SightingReport,
  uploadImage: (
    uri: string,
    callback: (uri: string, error?: string) => void,
  ) => Promise<void>,
  action: "new-sighting" | "edit-sighting",
) {
  if (sightingFormData.image.uri) {
    await uploadImage(sightingFormData.image.uri, (photo: string) =>
      action === "new-sighting"
        ? saveNewSighting(photo, sightingFormData)
        : updateSighting(photo, sightingFormData),
    );
  } else {
    if (action === "new-sighting") {
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
    !sightingFormData.sightingId ||
    !isValidUuid(sightingFormData.sightingId)
  ) {
    throw new Error("Missing or invalid sighting id");
  }

  const payload = await buildSightingPayload(photo, sightingFormData);
  const sightingRepository = new SightingRepository();
  return await sightingRepository.updateSighting(
    sightingFormData.sightingId,
    payload,
  );
}

function saveNotes(report: SightingReport) {
  let notes = report.note ? `${report.note}\n` : "";

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
  } as Partial<AggregatedSighting>;

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

  if (sightingFormData.petDescriptionId && isValidUuid(sightingFormData.petDescriptionId)) {
    payload.petDescriptionId = sightingFormData.petDescriptionId;
  }

  return payload;
}
