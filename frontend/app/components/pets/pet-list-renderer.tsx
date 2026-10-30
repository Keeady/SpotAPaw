"use client";

import { Pet } from "../../../lib/pets/pet";
import PetProfileCard from "./pet-profile";

export default function PetListRenderer({ pets }: { pets: Pet[] }) {
  const noop = () => void 0;

  return (
    <ul className="flex flex-col text-start">
      {pets.map((pet) => (
        <li key={pet.id}>
          <PetProfileCard
            petProfile={{...pet, status: pet.isLost ? "lost" : "safe"}}
            onDeletePet={noop}
            onEditPet={noop}
            onPetFound={noop}
            onPetLost={noop}
            viewPetSightings={noop}
          />
        </li>
      ))}
    </ul>
  );
}
