import CreatePetDetails from "@/components/pets/pet-create";
import { createNewPet } from "@/components/pets/pet-crud";
import { AuthContext } from "@/components/Provider/auth-provider";
import { Pet } from "@/model/pet";
import { useContext } from "react";

export default function addPet() {
  const { user } = useContext(AuthContext);

  if (!user) {
    return;
  }

  return <CreatePetDetails handleSubmit={(data: Pet) => createNewPet(data, user.id)} />
}
