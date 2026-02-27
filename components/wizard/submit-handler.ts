import { getLastSeenLocation, isValidUuid } from "../util";
import { SightingReport } from "./wizard-interface";
import { supabase } from "../supabase-client";

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
  const { data, error } = await supabase
    .from("sightings")
    .insert([payload])
    .select("id");

  if (error) {
    throw error;
  }

  return data;
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

  const { data, error } = await supabase
    .from("aggregated_sightings")
    .update(payload)
    .eq("linked_sighting_id", sightingFormData.linkedSightingId);

  if (error) {
    throw error;
  }

  return data;
}

function saveNotes(report: SightingReport) {
  let notes = report.note || "";

  if (report.petBehavior) {
    notes = notes.concat("\n");
    notes = notes.concat(`Pet behavior: ${report.petBehavior}`);
  }

  return notes;
}

async function buildSightingPayload(
  photo: string,
  sightingFormData: SightingReport,
) {
  const lastSeenFormatted = await getLastSeenLocation(
    sightingFormData.last_seen_location,
    sightingFormData.last_seen_lat,
    sightingFormData.last_seen_long,
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
    collar_description: sightingFormData.collarDescription,
    photo: photo ? photo : sightingFormData.photo,
    note: saveNotes(sightingFormData),
    last_seen_location: lastSeenFormatted,
    last_seen_long: sightingFormData.last_seen_long,
    last_seen_lat: sightingFormData.last_seen_lat,
    last_seen_time: sightingFormData.last_seen_time,
    reporter_name: sightingFormData.contactName,
    reporter_phone: sightingFormData.contactPhone,
  } as any;

  if (sightingFormData.id && isValidUuid(sightingFormData.id)) {
    payload.pet_id = sightingFormData.id;
  }

  if (
    sightingFormData.linkedSightingId &&
    isValidUuid(sightingFormData.linkedSightingId)
  ) {
    payload.linked_sighting_id = sightingFormData.linkedSightingId;
  }

  if (sightingFormData.reporterId && isValidUuid(sightingFormData.reporterId)) {
    payload.reporter_id = sightingFormData.reporterId;
  }

  return payload;
}
