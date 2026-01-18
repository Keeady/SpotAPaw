import { useContext, useEffect, useState } from "react";
import { supabase } from "../supabase-client";
import { PetSighting, PetSightingSummary } from "@/model/sighting";
import { AuthContext } from "../Provider/auth-provider";
import { log } from "../logs";

export function usePetSightings(petId: string, sightingId: string) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeline, setTimeline] = useState<PetSighting[]>([]);
  const [summary, setSummary] = useState<PetSightingSummary>();
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
      fetchSightingsBySightingIdForUser(sightingId);
    } else {
      fetchSightingsBySightingId(sightingId);
    }
  }, [petId, sightingId, user]);

  return { loading, error, timeline, summary };
}
