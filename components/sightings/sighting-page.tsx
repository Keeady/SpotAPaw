import { use, useCallback, useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { Button } from "react-native-paper";
import { getUserLocation, SightingLocation } from "../get-current-location";
import { supabase } from "../supabase-client";
import { JSX } from "react/jsx-runtime";
import { PetSighting } from "@/model/sighting";
import { AuthContext } from "../Provider/auth-provider";
import {
  MAX_SIGHTINGS,
  SIGHTING_OFFSET,
  SIGHTING_RADIUSKM,
} from "../constants";
import { useRouter } from "expo-router";
import { RenderSightingProfile } from "@/components/pet-profile";

import { isValidUuid } from "@/components/util";

import { EmptySighting } from "@/components/sightings/empty-sighting";

type SightingPageProps = {
  rendererItem: (item: PetSighting) => JSX.Element;
  renderer: (
    sightings: PetSighting[],
    onEndReached: () => void,
    error: string,
    onLocationRequestDenied: () => void,
    enableFromSettings: boolean,
    setEnableFromSettings: React.Dispatch<React.SetStateAction<boolean>>
  ) => JSX.Element;
};

export default function SightingPage({
  rendererItem,
  renderer,
}: SightingPageProps) {
  const [sightings, setSightings] = useState<PetSighting[]>([]);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<SightingLocation>();
  const { user } = useContext(AuthContext);
  const [pagination, setPagination] = useState({
    start: 0,
    end: MAX_SIGHTINGS,
  });
  const [error, setError] = useState("");
  const [enableFromSettings, setEnableFromSettings] = useState(false);
  const { height } = useWindowDimensions();

  useEffect(() => {
    getUserLocation()
      .then((location) => {
        console.log("User location:", location);
        setLocation(location);
      })
      .catch(() => {
        setError("Location access is needed to show nearby sightings.");
      });
  }, []);

  // Refetch when filter changes
  useEffect(() => {
    if (!location) {
      return;
    }
    console.log("Fetching sightings for location:", location, pagination.start);
    reFetchSightings();
  }, [location, user]);

  const reFetchSightings = useCallback(() => {
    console.log("Loading: ", loading, "location:", location);
    if (loading || !location) {
      return;
    }

    if (user) {
      setLoading(true);
      fetchSightingsByUser(location, pagination, onFetchComplete);
    } else {
      setLoading(true);
      fetchSightings(location, pagination, onFetchComplete);
    }
  }, [loading, location, pagination, user]);

  const onFetchComplete = useCallback(
    (newSightings: PetSighting[], error: string | null) => {
      console.log("Fetch complete. New sightings:", newSightings.length);
      if (error) {
        setError(error);
        //setEnablePagination(false);
      } else if (newSightings.length > 0) {
        processSightings(newSightings, setSightings);
        //setEnablePagination(true);
        setPagination((prev) => ({
          start: prev.end,
          end: prev.end + SIGHTING_OFFSET,
        }));
      } else {
        //setEnablePagination(false);
      }
      setLoading(false);
    },
    []
  );

  const onLocationRequestDenied = useCallback(() => {
    getUserLocation()
      .then((location) => {
        console.log("Asking User location:", location);
        setLocation(location);
        setError("");
        setEnableFromSettings(false);
      })
      .catch(() => {
        setError("Location access is needed to show nearby sightings.");
        setEnableFromSettings(false);
      });
  }, [setEnableFromSettings, setLocation, setError]);

  const onEndReached = useCallback(() => {
    console.log("End reached. Fetching more sightings...");
    reFetchSightings();
  }, [reFetchSightings]);

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
        <FlatList
          data={sightings}
          keyExtractor={(item) =>
            isValidUuid(item.pet_id) ? item.pet_id : item.id
          }
          renderItem={({ item }) => rendererItem(item)}
          ListEmptyComponent={
            <EmptySighting
              height={height}
              error={error}
              enableFromSettings={enableFromSettings}
              setEnableFromSettings={setEnableFromSettings}
              reloadPage={onLocationRequestDenied}
            />
          }
          style={{ marginBottom: 20 }}
          showsVerticalScrollIndicator={false}
          snapToAlignment="start"
          decelerationRate="fast"
          pagingEnabled
          onEndReached={onEndReached}
          onEndReachedThreshold={0.5}
        />
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
  data: PetSighting[],
  setSightings: React.Dispatch<React.SetStateAction<PetSighting[]>>
) => {
  // Merge sightings by pet_id or linked_sighting_id or sighting id
  const mergedSightings = Object.values(
    data.reduce((acc, sighting) => {
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
  setSightings((prev) => [...prev, ...mergedSightings]);
};
