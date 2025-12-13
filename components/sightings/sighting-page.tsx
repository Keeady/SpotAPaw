import { useCallback, useContext, useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Button, Portal } from "react-native-paper";
import {
  getCurrentUserLocationV3,
  SightingLocation,
} from "../get-current-location";
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
import { EmptySighting } from "@/components/sightings/empty-sighting";
import React from "react";
import ReportLostPetFab from "./report-fab";
import { useRouter } from "expo-router";
import { log } from "../logs";

type SightingPageProps = {
  renderer: (
    sightings: PetSighting[],
    onEndReached: () => void,
    ListEmptyComponent: () => JSX.Element
  ) => JSX.Element;
};

export default function SightingPage({ renderer }: SightingPageProps) {
  const router = useRouter();
  const [sightings, setSightings] = useState<PetSighting[]>([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<SightingLocation>();
  const { user } = useContext(AuthContext);
  const [pagination, setPagination] = useState({
    start: 0,
    end: MAX_SIGHTINGS,
  });
  const [error, setError] = useState("");
  const [enableFromSettings, setEnableFromSettings] = useState(false);

  useEffect(() => {
    getCurrentUserLocationV3()
      .then((location) => {
        if (location) {
          setLocation(location);
        }
      })
      .catch((err) => {
        log(`getCurrentUserLocationV3 ${err}`);
        setError("Location access is needed to show nearby sightings.");
        setLoading(false);
      });
  }, []);

  // Refetch when filter changes
  useEffect(() => {
    if (!location) {
      return;
    } else if (user) {
      fetchSightingsByUser(location, pagination, onFetchComplete);
    } else {
      fetchSightings(location, pagination, onFetchComplete);
    }
  }, [location, user, pagination]);

  const reLoadSightings = useCallback(
    (
      location: SightingLocation | undefined,
      pagination: { start: number; end: number }
    ) => {
      if (!location) {
        return;
      } else if (user) {
        fetchSightingsByUser(location, pagination, onFetchComplete);
      } else {
        fetchSightings(location, pagination, onFetchComplete);
      }
    },
    [user]
  );

  const onEndReached = useCallback(() => {
    setPagination((prev) => ({
      start: prev.end,
      end: prev.end + SIGHTING_OFFSET,
    }));
  }, []);

  const onFetchComplete = useCallback(
    (newSightings: PetSighting[], error: string | null) => {
      if (error) {
        log(error);
        setError(error);
      } else if (newSightings.length > 0) {
        processSightings(sightings, newSightings, setSightings);
      }
      setLoading(false);
    },
    [sightings]
  );

  const onLocationRequestDenied = useCallback(() => {
    getCurrentUserLocationV3()
      .then((location) => {
        if (location) {
          setLocation(location);
        }
        setError("");
        setEnableFromSettings(false);
        setLoading(true);
        reLoadSightings(location, { start: 0, end: MAX_SIGHTINGS });
      })
      .catch(() => {
        setError("Location access is needed to show nearby sightings.");
        setEnableFromSettings(false);
      });
  }, [reLoadSightings]);

  const ListEmptyComponent = useCallback(() => {
    return (
      <EmptySighting
        error={error}
        hasLocation={!!location}
        enableFromSettings={enableFromSettings}
        setEnableFromSettings={setEnableFromSettings}
        reloadPage={onLocationRequestDenied}
      />
    );
  }, [
    error,
    enableFromSettings,
    setEnableFromSettings,
    onLocationRequestDenied,
    location,
  ]);

  const sightingsRoute = user ? "my-sightings" : "sightings";

  return (
    <Portal.Host>
      <View style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: 10,
          }}
        >
          <Button mode="text" disabled={true}>
            {loading
              ? "Loading Nearby Sightings..."
              : "Showing Nearby Sightings"}
          </Button>
          {loading ? <ActivityIndicator size="small" /> : ""}
        </View>
        <View style={{ flex: 1 }}>
          {loading
            ? null
            : renderer(sightings, onEndReached, ListEmptyComponent)}
        </View>

        <ReportLostPetFab
          onChatbotPress={() => router.navigate(`/${sightingsRoute}/chat-bot`)}
          onFormPress={() => router.navigate(`/${sightingsRoute}/new`)}
        />
      </View>
    </Portal.Host>
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
    log(error.message);
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
    log(error.message);
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
