import { useEffect, useState } from "react";
import { supabase } from "../supabase-client";

// Helper to merge sightings into summary
export function mergeSightings(sightings) {
  return sightings.reduce((merged, s) => ({
    ...merged,
    id: merged.id ?? s.id,
    pet_id: merged.pet_id ?? s.pet_id,
    name: merged.name ?? s.name,
    photo: merged.photo ?? s.photo,
    last_seen_location: merged.last_seen_location ?? s.last_seen_location,
    note: merged.note ?? s.note,
    breed: merged.breed ?? s.breed,
    gender: merged.gender ?? s.gender,
    colors: merged.colors ?? s.colors,
    species: merged.species ?? s.species,
    features: merged.features ?? s.features,
  }), {});
}

export function usePetSightings(petId:string) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [summary, setSummary] = useState(null);
  const [sightingPetOwner, setSightingPetOwner] = useState(null)

  useEffect(() => {
    if (!petId) return;

    async function fetchSightings() {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("sightings")
        .select("*, sighting_pet_owner (owner_id)")
        .eq("pet_id", petId)
        .order("created_at", { ascending: false });

        console.log("error", error)

      if (error) {
        setError(error);
        setLoading(false);
        return;
      }

      setTimeline(data);
      setSightingPetOwner(data[0].sighting_pet_owner);
      setSummary(mergeSightings(data)); // merged summary
      setLoading(false);
    }

    fetchSightings();
  }, [petId]);

  return { loading, error, timeline, summary, sightingPetOwner };
}
