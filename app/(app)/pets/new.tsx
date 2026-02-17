import useUploadPetImageUrl from "@/components/image-upload-handler";
import CreatePetDetails from "@/components/pets/pet-create";
import { createNewPet } from "@/components/pets/pet-crud";
import { AuthContext } from "@/components/Provider/auth-provider";
import { Pet } from "@/model/pet";
import { useContext } from "react";

export default function AddPet() {
  const { user } = useContext(AuthContext);
  const uploadImage = useUploadPetImageUrl();

  if (!user) {
    return;
  }

  async function handleSaveNewPet(pet: Pet, photoUrl: string) {
    if (!pet || !user) {
      return;
    }
    createNewPet({ ...pet, photo: photoUrl }, user.id);
  }

  async function saveNewPet(pet: Pet) {
    if (!pet || !user) {
      return;
    }

    if (pet.photoUrl) {
      await uploadImage(pet.photoUrl, (photoUrl: string) =>
        handleSaveNewPet(pet, photoUrl),
      );
    } else {
      await handleSaveNewPet(pet, "");
    }
  }

  return <CreatePetDetails handleSubmit={saveNewPet} />;
}
