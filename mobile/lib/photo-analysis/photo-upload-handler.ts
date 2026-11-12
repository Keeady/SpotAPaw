import { AnalyzeMultipleResponse } from "@/components/analyzer/use-pet-image-analyzer";
import { PetImage } from "@/components/wizard/wizard-interface";
import { Pet } from "@/db/models/pet";

export default async function handlePhotoUploadAnalyze(
  onPhotoAnalyze: (
    images: PetImage[],
    petId: string | null,
    sightingId: string | null,
  ) => Promise<AnalyzeMultipleResponse | undefined>,
  images: PetImage[],
  petId: string | null,
  sightingId: string | null,
) {
  const analysis = await onPhotoAnalyze(images, petId, sightingId);
  if (analysis) {
    const { data, petDescriptionId, publicUrls } = analysis;

    const response = {
      publicUrls,
      petDescriptionId,
      pets: data && "pets" in data && data.pets.length > 0 ? data.pets : [],
      aiNote: data && "note" in data && data.note ? data.note : "",
    };

    if (
      response.pets.length === 0 ||
      response.aiNote.toLowerCase().includes("no pets detected")
    ) {
      throw new Error(response.aiNote || "Not pets detected", {
        cause: "NO_PETS_DETECTED",
      });
    }

    const pet = {} as Pet;
    if (response.pets.length > 0) {
      const petInfo = response.pets[0];
      if (petInfo.species) {
        pet["species"] = petInfo.species;
      }

      if (petInfo.breed) {
        pet["breed"] = petInfo.breed;
      }

      if (petInfo.colors && petInfo.colors.length > 0) {
        pet["colors"] = petInfo.colors.join(", ");
      }

      if (
        petInfo.distinctive_features &&
        petInfo.distinctive_features.length > 0
      ) {
        pet["features"] = petInfo.distinctive_features.join(", ");
      }

      if (
        petInfo.collar_descriptions &&
        petInfo.collar_descriptions.length > 0
      ) {
        pet["collarDescription"] = petInfo.collar_descriptions.join(",\n");
      }

      if (petInfo.size) {
        pet["size"] = petInfo.size;
      }

      if (publicUrls) {
        pet["photos"] = publicUrls;
      }

      if (petInfo.note) {
        pet["note"] = petInfo.note;
      }
    }

    return Promise.resolve({
      ...data,
      ...pet,
      photos: [...response.publicUrls],
      petDescriptionId: response.petDescriptionId,
      note: response.aiNote,
      images: [],
    });
  }
}
