import { supabase } from "../supabase-client";
import { PetReportData } from "./sighting-interface";
import * as chrono from "chrono-node";
import { getLastSeenLocation, isValidUuid } from "../util";

type ChatBotSightingResult = {
  error: string;
  reportId: string;
};

export const saveChatBotSighting = async (
  report: PetReportData,
  uploadImage: (uri: string, callback: (uri: string) => void) => Promise<void>,
  callback: (result: ChatBotSightingResult) => void
) => {
  const finalSighting = {
    name: report.petName,
    colors: report.color,
    features: report.distinctiveFeatures,
    species: report.petType,
    breed: report.breed,
    gender: report.gender,
    photo: "",
    last_seen_long: report.lastSeenLocationLng,
    last_seen_lat: report.lastSeenLocationLat,
    last_seen_location: await getLastSeenLocation(report),
    last_seen_time: convertTime(report.lastSeenTime || ""),
    pet_id: isValidUuid(report.petId) ? report.petId : null,
    note: saveNotes(report),
    reporter_phone: report.contactPhone,
    reporter_name: report.contactName,
    linked_sighting_id: isValidUuid(report.linkedSightingId)
      ? report.linkedSightingId
      : null,
  };

  // Upload image if exists and then save sighting
  if (report.photo) {
    uploadImage(report.photo, (url) => {
      finalSighting.photo = url || "";
      saveSightingInfo(finalSighting, callback);
    });
  } else {
    saveSightingInfo(finalSighting, callback);
  }
};

async function saveSightingInfo(
  finalSighting: any,
  callback: (result: ChatBotSightingResult) => void
) {
  let errorMsg = "";
  let reportId = "";

  const { error, data } = await supabase
    .from("sightings")
    .insert([finalSighting])
    .select();

  if (error) {
    console.error("Error saving sighting:", error);
    errorMsg = "Error saving report. Please try again.";
  }

  if (data) {
    reportId = data[0].id;
  }

  callback({
    error: errorMsg,
    reportId,
  });
}

function convertTime(time: string) {
  // Convert time to ISO 8601 format if possible
  let lastSeenTime = "";
  if (time) {
    try {
      const convertedDateTime = chrono.parseDate(time, new Date(), {
        forwardDate: false,
      });
      lastSeenTime =
        convertedDateTime?.toISOString() || new Date().toISOString();
    } catch {
      lastSeenTime = new Date().toISOString();
    }
  }

  return lastSeenTime;
}

function saveNotes(report: PetReportData) {
  let notes = report.notes || "";

  if (report.hasCollar === "yes_collar") {
    notes = notes.concat("\n");
    notes = notes.concat(`has a collar on - ${report.collarDescription}`);
  }

  if (report.hasCollar === "yes_harness") {
    notes = notes.concat("\n");
    notes = notes.concat(`has a harness on - ${report.collarDescription}`);
  }

  if (report.hasCollar === "yes_tags") {
    notes = notes.concat("\n");
    notes = notes.concat(`has a tag on - ${report.collarDescription}`);
  }

  if (report.petBehavior) {
    notes = notes.concat("\n");
    notes = notes.concat(`Pet behavior: ${report.petBehavior}`);
  }

  return notes;
}
