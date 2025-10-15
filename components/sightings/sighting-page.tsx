import { useCallback, useContext, useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Button } from "react-native-paper";
import { getUserLocation, SightingLocation } from "../get-current-location";
import { supabase } from "../supabase-client";
import { JSX } from "react/jsx-runtime";
import { PetSighting } from "@/model/sighting";
import { AuthContext } from "../Provider/auth-provider";
import { isValidUuid } from "../util";
import {
  MAX_SIGHTINGS,
  SIGHTING_OFFSET,
  SIGHTING_RADIUSKM,
} from "../constants";

type SightingPageProps = {
  renderer: (
    sightings: PetSighting[],
    onEndReached: () => void,
    error: string
  ) => JSX.Element;
};

export default function SightingPage({ renderer }: SightingPageProps) {
  const [sightings, setSightings] = useState<PetSighting[]>([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<SightingLocation>();
  const { user } = useContext(AuthContext);
  const [pagination, setPagination] = useState({
    start: 0,
    end: MAX_SIGHTINGS,
  });
  const [error, setError] = useState("");

  // Refetch when filter changes
  useEffect(() => {
    if (!location) {
      getUserLocation()
        .then((location) => {
          setLocation(location);
        })
        .catch(() => {
          setError("Location access is needed to show nearby sightings.");
        }); // ask for location if not yet set
    } else if (user) {
      fetchSightingsByUser(location, pagination, onFetchComplete);
    } else {
      fetchSightings(location, pagination, onFetchComplete);
    }
  }, [location, user, pagination]);

  const onEndReached = useCallback(() => {
    setPagination((prev) => ({
      start: prev.end,
      end: prev.end + SIGHTING_OFFSET,
    }));
  }, []);

  const onFetchComplete = useCallback(
    (newSightings: PetSighting[], error: string | null) => {
      if (error) {
        setError(error);
      } else if (newSightings.length > 0) {
        processSightings(sightings, newSightings, setSightings);
      }
      setLoading(false);
    },
    [sightings]
  );

  return (
    <View style={{ flex: 1, padding: 5 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          gap: 10,
        }}
      >
        <Button mode="text" disabled={true}>
          {loading ? "Loading Nearby Sightings..." : "Showing Nearby Sightings"}
        </Button>
        {loading ? <ActivityIndicator size="small" /> : ""}
      </View>
      <View style={{ flex: 1, backgroundColor: "white" }}>
        {loading ? null : renderer(sightings, onEndReached, error)}
      </View>
    </View>
  );
}

const fetchSightings = async (
  location: SightingLocation | undefined,
  pagination: { start: number; end: number },
  onFetchComplete: (newSightings: PetSighting[], error: string | null) => void
) => {
  if (!location) {
    return;
  }

  fetchSightingsWithLocation(location, pagination, onFetchComplete);
};

const fetchSightingsByUser = async (
  location: SightingLocation | undefined,
  pagination: { start: number; end: number },
  onFetchComplete: (newSightings: PetSighting[], error: string | null) => void
) => {
  if (!location) {
    return;
  }

  fetchSightingsByUserWithLocation(location, pagination, onFetchComplete);
};

const fetchSightingsWithLocation = async (
  location: SightingLocation,
  pagination: { start: number; end: number },
  onFetchComplete: (newSightings: PetSighting[], error: string | null) => void
) => {
  const { lat, lng } = location;
  // ~111 km per 1 degree latitude
  const latDegree = SIGHTING_RADIUSKM / 111;
  // adjust longitude scaling by latitude
  const lngDegree = SIGHTING_RADIUSKM / (111 * Math.cos(lat * (Math.PI / 180)));

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
    .order("created_at", { ascending: false })
    .range(pagination.start, pagination.end);

  if (error) {
    onFetchComplete([], "An error occurred while fetching sightings.");
  } else {
    onFetchComplete(data || [], null);
  }
};

const fetchSightingsByUserWithLocation = async (
  location: SightingLocation,
  pagination: { start: number; end: number },
  onFetchComplete: (newSightings: PetSighting[], error: string | null) => void
) => {
  const { lat, lng } = location;
  // ~111 km per 1 degree latitude
  const latDegree = SIGHTING_RADIUSKM / 111;
  // adjust longitude scaling by latitude
  const lngDegree = SIGHTING_RADIUSKM / (111 * Math.cos(lat * (Math.PI / 180)));

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
    .order("created_at", { ascending: false })
    .range(pagination.start, pagination.end);

  if (error) {
    onFetchComplete([], "An error occurred while fetching sightings.");
  } else {
    onFetchComplete(data || [], null);
  }
};

const processSightings = (
  prevData: PetSighting[],
  data: PetSighting[],
  setSightings: React.Dispatch<React.SetStateAction<PetSighting[]>>
) => {
  const sightingData: PetSighting[] = prevData.concat(data);
  
  // Merge sightings by pet_id or linked_sighting_id or sighting id
  const mergedSightings = Object.values(
    sightingData.reduce((acc, sighting) => {
      // if we have a pet id, then group by pet id
      if (sighting.pet_id && isValidUuid(sighting.pet_id)) {
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
          };
        }
      }
      // if we have a linked sighting id, group by that
      else if (
        sighting.linked_sighting_id &&
        isValidUuid(sighting.linked_sighting_id)
      ) {
        if (!acc[sighting.linked_sighting_id]) {
          acc[sighting.linked_sighting_id] = {
            ...sighting,
            id: sighting.linked_sighting_id,
          };
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
      } 
      // otherwise, start a new grouping by this id
      else if (isValidUuid(sighting.id) && !acc[sighting.id]) {
        acc[sighting.id] = sighting;
      }

      return acc;
    }, {} as PetSighting)
  );
  setSightings(mergedSightings);
};
