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

  return saveNewSighting({ ...sightingFormData, petId }, []);
}

export async function saveSightingPhoto(
  sightingFormData: SightingReport,
  action: "new-sighting" | "edit-sighting",
  uploadMultiplePetImages: (
    images: { uri: string; filename: string; filetype: string }[],
    callback: (uri: string[], error?: string) => void,
  ) => Promise<void>,
) {
  if (sightingFormData.images && sightingFormData.images.length > 0) {
    return uploadMultiplePetImages?.(
      sightingFormData.images,
      (photoUrls: string[]) => {
        if (action === "new-sighting") {
          return saveNewSighting(sightingFormData, photoUrls);
        } else {
          return updateSighting(sightingFormData, photoUrls);
        }
      },
    );
  } else {
    if (action === "new-sighting") {
      return saveNewSighting(sightingFormData, []);
    } else {
      return updateSighting(sightingFormData, []);
    }
  }
}

export async function saveNewSighting(
  sightingFormData: SightingReport,
  photos: string[],
) {
  const payload = await buildSightingPayload(sightingFormData, photos);

  const repository = new SightingRepository();
  return repository.createSighting(payload);
}

export async function updateSighting(
  sightingFormData: SightingReport,
  photos: string[],
) {
  if (
    !sightingFormData.sightingId ||
    !isValidUuid(sightingFormData.sightingId)
  ) {
    throw new Error("Missing or invalid sighting id");
  }

  const payload = await buildSightingPayload(sightingFormData, photos);
  const sightingRepository = new SightingRepository();
  return sightingRepository.updateSighting(
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
  sightingFormData: SightingReport,
  photoUrls: string[],
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
    note: saveNotes(sightingFormData),
    lastSeenLocation: lastSeenFormatted,
    lastSeenLong: sightingFormData.lastSeenLong,
    lastSeenLat: sightingFormData.lastSeenLat,
    lastSeenTime: sightingFormData.lastSeenTime,
    reporterName: sightingFormData.reporterName,
    reporterPhone: sightingFormData.reporterPhone,
    photos: photoUrls?.length > 0 ? photoUrls : sightingFormData.photos,
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

  if (
    sightingFormData.petDescriptionId &&
    isValidUuid(sightingFormData.petDescriptionId)
  ) {
    payload.petDescriptionId = sightingFormData.petDescriptionId;
  }

  return payload;
}
