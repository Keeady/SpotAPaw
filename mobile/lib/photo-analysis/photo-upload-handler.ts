import { AnalyzeMultipleResponse } from "@/components/analyzer/use-pet-image-analyzer";
import { PetImage } from "@/components/wizard/wizard-interface";

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
    console.log(response);

    if (
      response.pets.length === 0 ||
      response.aiNote.toLowerCase().includes("no pets detected")
    ) {
      throw new Error(response.aiNote, { cause: "NO_PETS_DETECTED" });
    }

    const pet = response.pets[0];
    const colors = pet.colors.join("");
    return Promise.resolve({
      ...data,
        ...pet,
      photos: [...response.publicUrls],
      petDescriptionId: response.petDescriptionId,
      note: response.aiNote,
      colors,
      images: []
    });
  }
}
