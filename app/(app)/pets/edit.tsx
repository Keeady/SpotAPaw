import useUploadPetImageUrl from "@/components/image-upload-handler";
import { log } from "@/components/logs";
import EditPetDetails from "@/components/pets/pet-edit";
import { AuthContext } from "@/components/Provider/auth-provider";
import { getLastSeenLocation, isValidUuid } from "@/components/util";
import { SightingPet } from "@/components/wizard/wizard-interface";
import { Pet } from "@/db/models/pet";
import { Sighting } from "@/db/models/sighting";
import { PetRepository } from "@/db/repositories/pet-repository";
import { SightingRepository } from "@/db/repositories/sighting-repository";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { showMessage } from "react-native-flash-message";

export default function EditPet() {
  const { id, is_lost } = useLocalSearchParams<{
    id: string;
    is_lost: string;
  }>();
  const { user } = useContext(AuthContext);
  const [profileInfo, setProfileInfo] = useState<SightingPet>();
  const router = useRouter();
  const uploadImage = useUploadPetImageUrl();
  const isLost = Boolean(is_lost);

  useEffect(() => {
    if (!id || !isValidUuid(id)) {
      return;
    }
    const petRepository = new PetRepository();
    petRepository
      .getPet(id)
      .then((data) => {
        setProfileInfo(data);
      })
      .catch((error) => {
        log(error?.message || "");
      });
  }, [id]);

  const handleSubmit = async (photoUrl: string) => {
    if (!profileInfo || !user) {
      return;
    }

    const payload = {
      name: profileInfo.name,
      species: profileInfo.species,
      breed: profileInfo.breed,
      age: profileInfo.age,
      gender: profileInfo.gender,
      colors: profileInfo.colors,
      features: profileInfo.features,
      note: profileInfo.note,
      ownerId: user?.id,
      isLost: isLost,
    } as Partial<Pet>;

    if (photoUrl !== "") {
      payload.photo = photoUrl;
    }

    const petRepository = new PetRepository();
    await petRepository
      .updatePet(id, payload)
      .then(() => {
        showMessage({
          message: "Successfully updated pet profile.",
          type: "success",
          icon: "success",
          statusBarHeight: 50,
        });
        if (isLost) {
          handleLostPet(photoUrl);
        } else {
          router.replace(`/(app)/pets`);
        }
      })
      .catch(() => {
        showMessage({
          message: "Error updating pet profile.",
          type: "warning",
          icon: "warning",
          statusBarHeight: 50,
        });
      });
  };

  async function savePetInfo() {
    if (!profileInfo || !user) {
      return;
    }
    if (profileInfo.photoUrl) {
      await uploadImage(profileInfo.photoUrl, handleSubmit);
    } else {
      await handleSubmit("");
    }
  }

  const handleLostPet = async (photoUrl: string) => {
    if (!profileInfo || !user || !isValidUuid(id)) {
      return;
    }

    const lastSeenFormatted = await getLastSeenLocation(
      profileInfo.lastSeenLocation,
      profileInfo.lastSeenLat,
      profileInfo.lastSeenLong,
    );

    const payload: Partial<Sighting> = {
      name: profileInfo.name,
      species: profileInfo.species,
      breed: profileInfo.breed,
      gender: profileInfo.gender,
      colors: profileInfo.colors,
      features: profileInfo.features,
      note: profileInfo.note,
      reporterId: user?.id,
      lastSeenTime: profileInfo.lastSeenTime || new Date().toISOString(),
      lastSeenLocation: lastSeenFormatted,
      lastSeenLat: profileInfo.lastSeenLat,
      lastSeenLong: profileInfo.lastSeenLong,
      petId: id,
    };

    if (photoUrl !== "") {
      payload.photo = photoUrl;
    } else if (profileInfo.photo) {
      payload.photo = profileInfo.photo;
    }

    const sightingRepository = new SightingRepository();
    sightingRepository
      .createSighting(payload)
      .then((sightingId) => {
        showMessage({
          message: "Successfully updated pet sighting.",
          type: "success",
          icon: "success",
          statusBarHeight: 50,
        });
        if (isLost) {
          router.navigate(`/owner?sightingId=${sightingId}`);
        } else {
          router.replace(`/(app)/pets`);
        }
      })
      .catch(() => {
        showMessage({
          message: "Error updating pet sighting.",
          type: "warning",
          icon: "warning",
          statusBarHeight: 50,
        });
      });
  };

  return EditPetDetails(savePetInfo, setProfileInfo, profileInfo, !!isLost);
}
