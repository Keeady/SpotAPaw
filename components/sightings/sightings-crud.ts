import { supabase } from "../supabase-client";
import { PetReportData } from "./sighting-interface";
import * as chrono from "chrono-node";
import { getLastSeenLocation, isValidUuid } from "../util";
import { log } from "../logs";

type ChatBotSightingResult = {
  error: string;
  reportId: string;
};

export const saveChatBotSighting = async (
  report: PetReportData,
  uploadImage: (
    uri: string,
    callback: (uri: string, error?: string) => void
  ) => Promise<void>,
  callback: (result: ChatBotSightingResult) => void,
  userId?: string
) => {
  const finalSighting = {
    name: report.petName,
    colors: report.color,
    features: report.distinctiveFeatures,
    species: report.petType,
    breed: report.breed,
    gender: report.gender,
    photo: report.photo,
    last_seen_long: report.lastSeenLocationLng,
    last_seen_lat: report.lastSeenLocationLat,
    last_seen_location: await getLastSeenLocation(
      report.lastSeenLocation || "",
      report.lastSeenLocationLat,
      report.lastSeenLocationLng
    ),
    last_seen_time: convertTime(report.lastSeenTime || ""),
    pet_id: isValidUuid(report.petId) ? report.petId : null,
    note: saveNotes(report),
    reporter_phone: report.contactPhone,
    reporter_name: report.contactName,
    reporter_id: userId,
    linked_sighting_id: isValidUuid(report.linkedSightingId)
      ? report.linkedSightingId
      : null,
  };

  try {
    // Upload image if exists and then save sighting
    if (report.photoUrl) {
      uploadImage(report.photoUrl, (url, error) => {
        if (error) {
          log(error);
          callback({
            error: "Error saving photo. Please try again.",
            reportId: "",
          });
          return;
        }
        finalSighting.photo = url || "";
        saveSightingInfo(finalSighting, callback);
      });
    } else {
      saveSightingInfo(finalSighting, callback);
    }
  } catch {
    callback({ error: "Error saving report. Please try again.", reportId: "" });
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
    log(error.message);
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
