import { Pet } from "@/model/pet";

export type SightingReport = Pet & {
  size: string;
  contactName: string;
  contactPhone: string;
  contactPhoneCountryCode: string;
  petBehavior: string;
  linkedSightingId: string;
  collar: "yes_collar" | "no";
  collarDescription: string;
  aiMessage: string;
};
