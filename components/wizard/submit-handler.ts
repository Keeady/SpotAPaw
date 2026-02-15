import { PetSighting } from "@/model/sighting";
import { getLastSeenLocation, isValidUuid } from "../util";
import { SightingReport } from "./wizard-interface";
import { supabase } from "../supabase-client";

export async function saveSightingPhoto(
  sightingFormData: SightingReport,
  uploadImage: (
    uri: string,
    callback: (uri: string, error?: string) => void,
  ) => Promise<void>,
) {
  if (sightingFormData.photoUrl) {
    await uploadImage(sightingFormData.photoUrl, (photo: string) =>
      saveNewSighting(photo, sightingFormData),
    );
  } else {
    await saveNewSighting("", sightingFormData);
  }
}

export async function saveNewSighting(
  photo: string,
  sightingFormData: SightingReport,
) {
  const lastSeenFormatted = await getLastSeenLocation(
    sightingFormData.last_seen_location,
    sightingFormData.last_seen_lat,
    sightingFormData.last_seen_long,
  );
  const payload = {
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
  } as PetSighting;

  if (sightingFormData.id && isValidUuid(sightingFormData.id)) {
    payload.pet_id = sightingFormData.id;
  }
  
  return await supabase
    .from("sightings")
    .insert([payload])
    .select("id");
}

function saveNotes(report: SightingReport) {
  let notes = report.note || "";

  if (report.petBehavior) {
    notes = notes.concat("\n");
    notes = notes.concat(`Pet behavior: ${report.petBehavior}`);
  }

  return notes;
}
