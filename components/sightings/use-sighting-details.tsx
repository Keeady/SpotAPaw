import { useEffect, useState } from "react";
import { supabase } from "../supabase-client";

// Helper to merge sightings into summary
export function mergeSightings(sightings) {
  return sightings.reduce(
    (merged, s) => ({
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
    }),
    {}
  );
}

export function usePetSightings(petId: string, sightingId: string) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [summary, setSummary] = useState(null);

  async function fetchSightingsBySightingId(sightingId: string) {
    setLoading(true);
    setError(null);
    console.log("sightingId", sightingId);

    const { data, error } = await supabase
      .from("sightings")
      .select("*")
      .eq("id", sightingId)
      .single();
    console.log("fetchSightingsBySightingId error", error);

    if (error) {
      setError(error);
      setLoading(false);
      return;
    }

    setTimeline([data]);
    setSummary(data);
    setLoading(false);
  }

  async function fetchSightingsByPetId(petId: string) {
    setLoading(true);
    setError(null);
    console.log("fetchSightingsByPetId", petId);
    if (!petId) {
      return;
    }

    const { data, error } = await supabase
      .from("sightings")
      .select("*")
      .eq("pet_id", petId)
      .order("created_at", { ascending: false });

    console.log("fetchSightingsByPetId error", error);

    if (error) {
      setError(error);
      setLoading(false);
      return;
    }

    setTimeline(data);
    setSummary(mergeSightings(data)); // merged summary
    setLoading(false);
  }

  useEffect(() => {
    console.log("petId sightingId", petId, sightingId, petId == null, petId === null, !petId)
    if (!petId || petId === null || petId === "null") {
      fetchSightingsBySightingId(sightingId);
      return;
    } 
    
    fetchSightingsByPetId(petId);
    
  }, [petId, sightingId]);

  return { loading, error, timeline, summary };
}
