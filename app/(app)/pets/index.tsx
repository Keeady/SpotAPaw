import PetListRenderer from "@/components/pets/pet-list";
import { AuthContext } from "@/components/Provider/auth-provider";
import { supabase } from "@/components/supabase-client";
import { SightingPet } from "@/components/wizard/wizard-interface";
import { SupabasePetRepository } from "@/db/repositories/supabase/pet-repository";
import { useContext, useEffect, useState } from "react";

export default function PetListScreen() {
  const [pets, setPets] = useState<SightingPet[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user?.id) {
      setLoading(true);
      const petRepository = new SupabasePetRepository(supabase);

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
