import { useContext, useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Button, FAB } from "react-native-paper";
import { getUserLocation, SightingLocation } from "../get-current-location";
import { supabase } from "../supabase-client";
import { JSX } from "react/jsx-runtime";
import { PetSighting } from "@/model/sighting";
import { AuthContext } from "../Provider/auth-provider";
import { router } from "expo-router";

const RADIUSKM = 10;

export default function SightingPage({
  renderer,
}: {
  renderer: (sightings: PetSighting[]) => JSX.Element;
}) {
  const [sightings, setSightings] = useState<PetSighting[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterNearby, setFilterNearby] = useState(false);
  const [location, setLocation] = useState<SightingLocation>();
  const { user } = useContext(AuthContext);

  // Refetch when filter changes
  useEffect(() => {
    if (filterNearby && !location) {
      getUserLocation().then((location) => {
        setLocation(location);
      }); // ask for location if not yet set
    } else if (user) {
      fetchSightingsByUser(filterNearby, location, setLoading, setSightings);
    } else {
      fetchSightings(filterNearby, location, setLoading, setSightings);
    }
  }, [filterNearby, location]);

  return (
    <View className="flex-1 p-4">
      <Button onPress={() => setFilterNearby(!filterNearby)}>
        {filterNearby ? "Show All Recent Sightings" : "Show Nearby Sightings"}
      </Button>

      {loading ? <ActivityIndicator size="large" /> : renderer(sightings)}
    </View>
  );
}

const fetchSightings = async (
  filterNearby: boolean,
  location: SightingLocation | undefined,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setSightings: React.Dispatch<React.SetStateAction<PetSighting[]>>
) => {
  setLoading(true);
  if (filterNearby && location) {
    fetchSightingsWithLocation(location, setSightings, setLoading);
  } else {
    fetchSightingsNoLocation(setSightings, setLoading);
  }
};

const fetchSightingsByUser = async (
  filterNearby: boolean,
  location: SightingLocation | undefined,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setSightings: React.Dispatch<React.SetStateAction<PetSighting[]>>
) => {
  setLoading(true);
  if (filterNearby && location) {
    fetchSightingsByUserWithLocation(location, setSightings, setLoading);
  } else {
    fetchSightingsByUserNoLocation(setSightings, setLoading);
  }
};

const fetchSightingsNoLocation = async (
  setSightings: React.Dispatch<React.SetStateAction<PetSighting[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  // Default: fetch all sightings
  const { data, error } = await supabase
    .from("sightings")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) console.error(error);
  else {
    processSightings(data || [], setSightings);
    setLoading(false);
  }
};

const fetchSightingsByUserNoLocation = async (
  setSightings: React.Dispatch<React.SetStateAction<PetSighting[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  // Default: fetch all sightings
  const { data, error } = await supabase
    .from("sightings")
    .select("*, sighting_contact (sighting_id, name, phone)")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) console.error(error);
  else {
    processSightings(data || [], setSightings);
    setLoading(false);
  }
};

const fetchSightingsWithLocation = async (
  location: SightingLocation,
  setSightings: React.Dispatch<React.SetStateAction<PetSighting[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const { lat, lng } = location;
  // ~111 km per 1 degree latitude
  const latDegree = RADIUSKM / 111;
  // adjust longitude scaling by latitude
  const lngDegree = RADIUSKM / (111 * Math.cos(lat * (Math.PI / 180)));

  const minLat = lat - latDegree;
  const maxLat = lat + latDegree;
  const minLng = lng - lngDegree;
  const maxLng = lng + lngDegree;

  // Default: fetch all sightings
  const { data, error } = await supabase
    .from("sightings")
    .select("*")
    .eq("is_active", true)
    .gte("last_seen_lat", minLat)
    .lte("last_seen_lat", maxLat)
    .gte("last_seen_long", minLng)
    .lte("last_seen_long", maxLng)
    .order("created_at", { ascending: false });

  if (error) console.error(error);
  else {
    processSightings(data || [], setSightings);
    setLoading(false);
  }
};

const fetchSightingsByUserWithLocation = async (
  location: SightingLocation,
  setSightings: React.Dispatch<React.SetStateAction<PetSighting[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const { lat, lng } = location;
  // ~111 km per 1 degree latitude
  const latDegree = RADIUSKM / 111;
  // adjust longitude scaling by latitude
  const lngDegree = RADIUSKM / (111 * Math.cos(lat * (Math.PI / 180)));

  const minLat = lat - latDegree;
  const maxLat = lat + latDegree;
  const minLng = lng - lngDegree;
  const maxLng = lng + lngDegree;

  // Default: fetch all sightings
  const { data, error } = await supabase
    .from("sightings")
    .select("*, sighting_contact (sighting_id, name, phone)")
    .eq("is_active", true)
    .gte("last_seen_lat", minLat)
    .lte("last_seen_lat", maxLat)
    .gte("last_seen_long", minLng)
    .lte("last_seen_long", maxLng)
    .order("created_at", { ascending: false });

  if (error) console.error(error);
  else {
    processSightings(data || [], setSightings);
    setLoading(false);
  }
};

const processSightings = (
  data: PetSighting[],
  setSightings: React.Dispatch<React.SetStateAction<PetSighting[]>>
) => {
  const sightings = [];
  const linkedSightingIds = new Set();
  // merge data by pet id
  // create a summary from
  const latestByPet = Object.values(
    data.reduce((acc, sighting) => {
      // if we have a pet id, then group by pet id
      if (sighting.pet_id && sighting.pet_id != "null") {
        if (!acc[sighting.pet_id]) {
          acc[sighting.pet_id] = sighting;
        } else {
          const merged = acc[sighting.pet_id];
          acc[sighting.pet_id] = {
            id: merged.id,
            pet_id: sighting.pet_id,
            photo: !!merged.photo ? merged.photo : sighting.photo,
            name: merged.name ?? sighting.name,
            colors: merged.colors ?? sighting.colors,
            breed: merged.breed ?? sighting.breed,
            species: merged.species ?? sighting.species,
            gender: merged.gender ?? sighting.gender,
            features: merged.features ?? sighting.features,
            last_seen_location:
              merged.last_seen_location ?? sighting.last_seen_location,
            last_seen_time: merged.last_seen_time,
            //sighting_contact: merged.sighting_contact,
          };
        }
      }
      // if we have a linked sighting id, group by that
      else if (sighting.linked_sighting_id) {
        if (!acc[sighting.linked_sighting_id]) {
          acc[sighting.linked_sighting_id] = sighting;
        } else {
          const merged = acc[sighting.linked_sighting_id];
          acc[sighting.linked_sighting_id] = {
            pet_id: "",
            photo: !!merged.photo ? merged.photo : sighting.photo,
            name: merged.name ?? sighting.name,
            colors: merged.colors ?? sighting.colors,
            breed: merged.breed ?? sighting.breed,
            species: merged.species ?? sighting.species,
            gender: merged.gender ?? sighting.gender,
            features: merged.features ?? sighting.features,
            last_seen_location:
              merged.last_seen_location ?? sighting.last_seen_location,
            last_seen_time: merged.last_seen_time,
            // sighting_contact: merged.sighting_contact,
            id: sighting.linked_sighting_id,
          };
        }

        !linkedSightingIds.has(sighting.linked_sighting_id) &&
          linkedSightingIds.add(sighting.linked_sighting_id);
      } else if (!linkedSightingIds.has(sighting.id)) {
        sightings.push(sighting);
      }

      return acc;
    }, {} as PetSighting)
  );
  setSightings([...sightings, ...latestByPet]);
};
