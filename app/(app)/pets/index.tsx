import PetListRenderer from "@/components/pets/pet-list";
import { AuthContext } from "@/components/Provider/auth-provider";
import { supabase } from "@/components/supabase-client";
import { SightingPet } from "@/components/wizard/wizard-interface";
import { SupabasePetRepository } from "@/db/repositories/supabase/pet-repository";
import { Pet } from "@/model/pet";
import { useContext, useEffect, useState } from "react";

export default function PetListScreen() {
  const [pets, setPets] = useState<SightingPet[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);

  const petRepository = new SupabasePetRepository(supabase);

  useEffect(() => {
    if (user?.id) {
      setLoading(true);
      petRepository.getPets(user.id).then((data) => {
        if (data && data.length > 0) {
          setPets(data);
        }
        setLoading(false);
      });
    }
  }, [user?.id]);

  if (loading) {
    return null;
  }

  return <PetListRenderer pets={pets} />;
}
