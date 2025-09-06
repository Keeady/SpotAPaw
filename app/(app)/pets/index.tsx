import PetListRenderer from "@/components/pets/pet-list";
import { supabase } from "@/components/supabase-client";
import { Pet } from "@/model/pet";
import { useEffect, useState } from "react";

export default function PetListScreen() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    supabase
      .from("pets")
      .select(`*`)
      .then(({ data }) => {
        setPets(data ?? []);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return null;
  }

  return (
    <PetListRenderer pets={pets} />
  );
}


