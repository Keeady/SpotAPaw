import { useContext, useEffect, useState } from "react";
import { supabase } from "../supabase-client";
import { PetSighting } from "@/model/sighting";
import { AuthContext } from "../Provider/auth-provider";
import { log } from "../logs";

// Helper to merge sightings into summary
export function mergeSightings(sightings: PetSighting[]) {
  return sightings.reduce(
    (merged, s) => ({
      ...merged,
      id: merged.id ?? s.id,
      pet_id: merged.pet_id ?? s.pet_id,
      name: merged.name ?? s.name,
      photo: !!merged.photo ? merged.photo : s.photo,
      last_seen_location: merged.last_seen_location ?? s.last_seen_location,
      note: merged.note ?? s.note,
      breed: merged.breed ?? s.breed,
      gender: merged.gender ?? s.gender,
      colors: merged.colors ?? s.colors,
      species: merged.species ?? s.species,
      features: merged.features ?? s.features,
      last_seen_long: merged.last_seen_long ?? s.last_seen_long,
      last_seen_lat: merged.last_seen_lat ?? s.last_seen_lat,
    }),
    {} as PetSighting
  );
}

export function usePetSightings(petId: string, sightingId: string) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeline, setTimeline] = useState<PetSighting[]>([]);
  const [summary, setSummary] = useState<PetSighting>();
  const { user } = useContext(AuthContext);

  async function fetchSightingsBySightingId(sightingId: string) {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("sightings")
      .select("*")
      .or(`linked_sighting_id.eq.${sightingId}, id.eq.${sightingId}`)
      .order("last_seen_time", { ascending: false });

    if (error) {
      log(error.message);
      setError(error);
      setLoading(false);
      return;
    }

    if (data) {
      setTimeline(data);
      setSummary(mergeSightings(data)); // merged summary
    }

    setLoading(false);
  }

  async function fetchSightingsByPetId(petId: string) {
    setLoading(true);
    setError(null);
    if (!petId) {
      return;
    }

    const { data, error } = await supabase
      .from("sightings")
      .select("*")
      .eq("pet_id", petId)
      .order("last_seen_time", { ascending: false });

    if (error) {
      log(error.message);
      setError(error);
      setLoading(false);
      return;
    }

    setTimeline(data);
    setSummary(mergeSightings(data)); // merged summary
    setLoading(false);
  }

  async function fetchSightingsByPetIdForUser(petId: string) {
    setLoading(true);
    setError(null);
    if (!petId) {
      return;
    }

    const { data, error } = await supabase
      .from("sightings")
      .select("*, sighting_contact(name, phone)")
      .eq("pet_id", petId)
      .order("last_seen_time", { ascending: false });

    if (error) {
      log(error.message);
      setError(error);
      setLoading(false);
      return;
    }

    setTimeline(data);
    setSummary(mergeSightings(data)); // merged summary
    setLoading(false);
  }

  async function fetchSightingsBySightingIdForUser(sightingId: string) {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("sightings")
      .select("*, sighting_contact(name, phone)")
      .or(`linked_sighting_id.eq.${sightingId}, id.eq.${sightingId}`)
      .order("last_seen_time", { ascending: false });

    if (error) {
      log(error.message);
      setError(error);
      setLoading(false);
      return;
    }

    if (data) {
      setTimeline(data);
      setSummary(mergeSightings(data)); // merged summary
    }

    setLoading(false);
  }

  useEffect(() => {
    if (user) {
      if (!petId || petId === null || petId === "null") {
        fetchSightingsBySightingIdForUser(sightingId);
        return;
      }

      fetchSightingsByPetIdForUser(petId);
    } else {
      if (!petId || petId === null || petId === "null") {
        fetchSightingsBySightingId(sightingId);
        return;
      }

      fetchSightingsByPetId(petId);
    }
  }, [petId, sightingId, user]);

  return { loading, error, timeline, summary };
}
