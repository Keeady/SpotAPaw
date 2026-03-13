import { Pet } from "@/db/models/pet";

export type SightingPet = Pet & {
  photoUrl?: string;
}

export type SightingReport = SightingPet & {
  size: string;
  contactName: string;
  contactPhone: string;
  contactPhoneCountryCode: string;
  petBehavior: string;
  linkedSightingId: string;
  collar: "yes_collar" | "no";
  collarDescription: string;
  aiMessage: string;
  image: PetImage;
  reporterId: string;
};

export type PetImage = {
  uri: string;
  filename: string;
  filetype: string;
};
