import { PetImage } from "@/components/wizard/wizard-interface";
import { SightingFormData } from "@/components/wizard2.0/wizard-types";
import { TFunction } from "i18next";

export default async function handleSightingImageUpload(
  t: TFunction<"wizard", undefined>,
  uploadMultiplePetImages: (
    images: {
      uri: string;
      filename: string;
      filetype: string;
    }[],
    callback: (uri: string[], error?: string | undefined) => void,
    petId: string | null,
    sightingId: string | null,
  ) => Promise<string[]>,
  data: SightingFormData,
  sightingId: string | null,
  images: PetImage[],
) {
  if (images.length === 0) {
    return data;
  }

  const urls = await uploadMultiplePetImages?.(
    images,
    (uris) => {
      return {
        ...data,
        photos: uris,
      };
    },
    null,
    sightingId,
  );

  return {
    ...data,
    photos: urls,
  };
}
