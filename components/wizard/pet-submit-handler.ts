import { PetRepository } from "@/db/repositories/pet-repository";
import { SightingPet, SightingReport } from "./wizard-interface";
import { getLastSeenLocation, isValidUuid } from "../util";

export async function saveNewPetPhoto(
  sightingFormData: SightingPet,
  uploadImage: (
    uri: string,
    callback: (photoUrl: string) => void,
  ) => Promise<void>,
  userId: string,
  onPetCreated?: (
    newPetId: string,
    sightingFormData: SightingReport,
  ) => Promise<string | undefined>,
) {
  if (sightingFormData.image?.uri) {
    await uploadImage(sightingFormData.image.uri, (photoUrl: string) =>
      saveNewPet(photoUrl, sightingFormData, userId, onPetCreated),
    );
  } else {
    await saveNewPet("", sightingFormData, userId, onPetCreated);
  }
}

export async function updateNewPetPhoto(
  sightingFormData: SightingPet,
  uploadImage: (
    uri: string,
    callback: (photoUrl: string) => void,
  ) => Promise<void>,
  onPetUpdated?: (
    newPetId: string,
    sightingFormData: SightingReport,
  ) => Promise<string | undefined>,
) {
  if (!sightingFormData.id || !isValidUuid(sightingFormData.id)) {
    throw new Error("Missing or invalid pet id");
  }

  if (sightingFormData.image?.uri) {
    await uploadImage(sightingFormData.image.uri, (photoUrl: string) =>
      updatePet(photoUrl, sightingFormData, onPetUpdated),
    );
  } else {
    await updatePet("", sightingFormData, onPetUpdated);
  }
}

export async function saveNewPet(
  photoUrl: string,
  sightingFormData: SightingPet,
  userId: string,
  onPetCreated?: (
    newPetId: string,
    sightingFormData: SightingReport,
  ) => Promise<string | undefined>,
) {
  const payload = await buildPetPayload(photoUrl, sightingFormData, userId);

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
  photoUrl: string,
  sightingFormData: SightingPet,
  onPetUpdated?: (
    newPetId: string,
    sightingFormData: SightingReport,
  ) => Promise<string | undefined>,
) {
  if (!sightingFormData.id || !isValidUuid(sightingFormData.id)) {
    throw new Error("Missing or invalid pet id");
  }

  const payload = await buildPetPayload(photoUrl, sightingFormData, "");

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
  photoUrl: string,
  sightingFormData: SightingPet,
  userId: string,
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
    photo: photoUrl ? photoUrl : sightingFormData.photo,
    gender: sightingFormData.gender,
    age: sightingFormData.age,
    features: sightingFormData.features,
    note: sightingFormData.note,
    isLost: sightingFormData.isLost,
    lastSeenTime: sightingFormData.lastSeenTime || new Date().toISOString(),
    lastSeenLat: sightingFormData.lastSeenLat,
    lastSeenLong: sightingFormData.lastSeenLong,
    lastSeenLocation: lastSeenFormatted,
  } as Partial<SightingPet>;

  if (userId && isValidUuid(userId)) {
    payload.ownerId = userId;
  }

  if (sightingFormData.id && isValidUuid(sightingFormData.id)) {
    payload.id = sightingFormData.id;
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
  } as SightingReport;
}
