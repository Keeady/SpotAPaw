import { PetRepository } from "@/db/repositories/pet-repository";
import { SightingPet, SightingReport } from "./wizard-interface";
import { getLastSeenLocation, isValidUuid } from "../util";

export async function saveNewPetPhoto(
  sightingFormData: SightingPet,
  userId: string,
  onPetCreated?: (
    newPetId: string,
    sightingFormData: SightingReport,
  ) => Promise<string | undefined>,
  uploadMultiplePetImages?: (
    images: { uri: string; filename: string; filetype: string }[],
    callback: (uri: string[], error?: string) => void,
  ) => Promise<void>,
) {
  if (sightingFormData.images && sightingFormData.images.length > 0) {
    await uploadMultiplePetImages?.(
      sightingFormData.images,
      (photoUrls: string[]) =>
        saveNewPet(sightingFormData, userId, onPetCreated, photoUrls),
    );
  } else {
    await saveNewPet(sightingFormData, userId, onPetCreated, []);
  }
}

export async function updateNewPetPhoto(
  sightingFormData: SightingPet,
  onPetUpdated?: (
    newPetId: string,
    sightingFormData: SightingReport,
  ) => Promise<string | undefined>,
  uploadMultiplePetImages?: (
    images: { uri: string; filename: string; filetype: string }[],
    callback: (uri: string[], error?: string) => void,
  ) => Promise<void>,
) {
  if (!sightingFormData.id || !isValidUuid(sightingFormData.id)) {
    throw new Error("Missing or invalid pet id");
  }

  if (sightingFormData.images && sightingFormData.images.length > 0) {
    await uploadMultiplePetImages?.(
      sightingFormData.images,
      (photoUrls: string[]) =>
        updatePet(sightingFormData, onPetUpdated, photoUrls),
    );
  } else {
    await updatePet(sightingFormData, onPetUpdated, []);
  }
}

export async function saveNewPet(
  sightingFormData: SightingPet,
  userId: string,
  onPetCreated?: (
    newPetId: string,
    sightingFormData: SightingReport,
  ) => Promise<string | undefined>,
  photoUrls: string[] = [],
) {
  const payload = await buildPetPayload(
    sightingFormData,
    userId,
    photoUrls,
  );

  const petRepository = new PetRepository();
  return await petRepository.createPet(payload).then(async (newPetId) => {
    if (onPetCreated) {
      return await onPetCreated(
        newPetId,
        buildSightingPayload(newPetId, sightingFormData, userId),
      );
    }

    return newPetId;
  });
}

export async function updatePet(
  sightingFormData: SightingPet,
  onPetUpdated?: (
    newPetId: string,
    sightingFormData: SightingReport,
  ) => Promise<string | undefined>,
  photoUrls: string[] = [],
) {
  if (!sightingFormData.id || !isValidUuid(sightingFormData.id)) {
    throw new Error("Missing or invalid pet id");
  }

  const payload = await buildPetPayload(
    sightingFormData,
    "",
    photoUrls,
  );

  const petRepository = new PetRepository();
  return await petRepository
    .updatePet(sightingFormData.id, payload)
    .then(async () => {
      if (onPetUpdated) {
        return await onPetUpdated(
          sightingFormData.id,
          buildSightingPayload(sightingFormData.id, sightingFormData, ""),
        );
      }
    });
}

async function buildPetPayload(
  sightingFormData: SightingPet,
  userId: string,
  photoUrls: string[],
) {
  const lastSeenFormatted = await getLastSeenLocation(
    sightingFormData.lastSeenLocation,
    sightingFormData.lastSeenLat,
    sightingFormData.lastSeenLong,
  );

  const payload = {
    name: sightingFormData.name,
    species: sightingFormData.species,
    breed: sightingFormData.breed,
    colors: sightingFormData.colors,
    gender: sightingFormData.gender,
    age: sightingFormData.age,
    features: sightingFormData.features,
    note: sightingFormData.note,
    isLost: sightingFormData.isLost,
    lastSeenTime: sightingFormData.lastSeenTime || new Date().toISOString(),
    lastSeenLat: sightingFormData.lastSeenLat,
    lastSeenLong: sightingFormData.lastSeenLong,
    lastSeenLocation: lastSeenFormatted,
    photos: photoUrls?.length > 0 ? photoUrls : sightingFormData.photos,
  } as Partial<SightingPet>;

  if (userId && isValidUuid(userId)) {
    payload.ownerId = userId;
  }

  if (sightingFormData.id && isValidUuid(sightingFormData.id)) {
    payload.id = sightingFormData.id;
  }

  if (
    sightingFormData.petDescriptionId &&
    isValidUuid(sightingFormData.petDescriptionId)
  ) {
    payload.petDescriptionId = sightingFormData.petDescriptionId;
  }

  return payload;
}

function buildSightingPayload(
  newPetId: string,
  sightingFormData: SightingPet,
  userId: string,
) {
  return {
    ...sightingFormData,
    id: newPetId,
    petId: newPetId,
    isActive: true,
    reporterId: userId,
    reporterName: (sightingFormData as SightingReport).reporterName,
    reporterPhone: (sightingFormData as SightingReport).reporterPhone,
    size: (sightingFormData as SightingReport).size,
    collarDescription: (sightingFormData as SightingReport).collarDescription,
    linkedSightingId: (sightingFormData as SightingReport).linkedSightingId,
    sightingId: (sightingFormData as SightingReport).sightingId,
    petDescriptionId: sightingFormData.petDescriptionId,
  } as SightingReport;
}
