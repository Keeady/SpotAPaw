import { useContext, useEffect, useState } from "react";
import { supabase } from "../supabase-client";
import { PetSighting } from "@/model/sighting";
import { AuthContext } from "../Provider/auth-provider";
import { log } from "../logs";

export function usePetSightings(petId: string, sightingId: string) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeline, setTimeline] = useState<PetSighting[]>([]);
  const [summary, setSummary] = useState<PetSighting>();
  const { user } = useContext(AuthContext);

  async function fetchSummary(sightingId: string) {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("aggregated_sightings")
      .select("*")
      .eq("is_active", true)
      .eq("linked_sighting_id", sightingId);

    if (error) {
      console.log(error);
      log(error.message);
      setError(error);
      setLoading(false);
      return;
    }

    if (data) {
      setSummary(data[0]);
    }

    setLoading(false);
  }

  async function fetchSightingsBySightingId(sightingId: string) {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("sightings")
      .select("*")
      .eq("is_active", true)
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
      .eq("is_active", true)
      .order("last_seen_time", { ascending: false });

    if (error) {
      log(error.message);
      setError(error);
      setLoading(false);
      return;
    }

    setTimeline(data);
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
      .eq("is_active", true)
      .order("last_seen_time", { ascending: false });

    if (error) {
      log(error.message);
      setError(error);
      setLoading(false);
      return;
    }

    setTimeline(data);
    setLoading(false);
  }

  async function fetchSightingsBySightingIdForUser(sightingId: string) {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("sightings")
      .select("*, sighting_contact(name, phone)")
      .is("is_active", true)
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
    }

    setLoading(false);
  }

  useEffect(() => {
    fetchSummary(sightingId);

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
