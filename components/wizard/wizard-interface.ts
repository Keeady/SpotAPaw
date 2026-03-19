import { Pet } from "@/db/models/pet";
import { AggregatedSighting } from "@/db/models/sighting";

export type SightingPet = Pet & {
  photoUrl?: string;
};

export type SightingReport = AggregatedSighting & {
  contactPhoneCountryCode: string;
  collarDescription: string;
  aiMessage: string;
  image: PetImage;
  collar: "yes_collar" | "no";
  petBehavior: string;
};

export type PetImage = {
  uri: string;
  filename: string;
  filetype: string;
};
