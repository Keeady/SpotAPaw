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
import {
  MAX_SIGHTINGS,
  SIGHTING_OFFSET,
  SIGHTING_RADIUSKM,
} from "../constants";
import { EmptySighting } from "@/components/sightings/empty-sighting";
import ReportLostPetFab from "./report-fab";
import { useRouter } from "expo-router";
import { log } from "../logs";

type SightingPageProps = {
  renderer: (
    sightings: PetSighting[],
    onEndReached: () => void,
    ListEmptyComponent: () => JSX.Element,
    onRefresh: () => void,
    refreshing: boolean,
  ) => JSX.Element;
};

type SightingPagination = {
  start: number;
  end: number;
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
  const [refreshing, setRefreshing] = useState(false);

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
        setEnableFromSettings(true);
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

  const onEndReached = useCallback(() => {
    setPagination((prev) => ({
      start: prev.end,
      end: prev.end + SIGHTING_OFFSET,
    }));
  }, []);

  const onFetchComplete = useCallback(
    (
      newSightings: PetSighting[],
      error: string | null,
      pagination?: SightingPagination,
    ) => {
      if (error) {
        log(error);
        setError(error);
      } else if (pagination?.start === 0) {
        setSightings(newSightings);
      } else if (newSightings.length > 0) {
        setSightings((prev) => [...prev, ...newSightings]);
      }
      setLoading(false);
      setRefreshing(false);
    },
    [],
  );

  const reLoadSightings = useCallback(
    (
      location: SightingLocation | undefined,
      pagination: { start: number; end: number },
    ) => {
      if (!location) {
        return;
      } else if (user) {
        fetchSightingsByUser(location, pagination, onFetchComplete);
      } else {
        fetchSightings(location, pagination, onFetchComplete);
      }
    },
    [user, onFetchComplete],
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
        setEnableFromSettings(true);
      });
  }, [reLoadSightings]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    reLoadSightings(location, { start: 0, end: MAX_SIGHTINGS });
  }, [reLoadSightings, location]);

  const ListEmptyComponent = useCallback(() => {
    return (
      <EmptySighting
        error={error}
        hasLocation={!!location}
        enableFromSettings={enableFromSettings}
        reloadPage={onLocationRequestDenied}
      />
    );
  }, [
    error,
    enableFromSettings,
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
            : renderer(
                sightings,
                onEndReached,
                ListEmptyComponent,
                onRefresh,
                refreshing,
              )}
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
  onFetchComplete: (newSightings: PetSighting[], error: string | null) => void,
) => {
  if (!location) {
    return;
  }

  fetchSightingsWithLocation(location, pagination, onFetchComplete);
};

const fetchSightingsByUser = async (
  location: SightingLocation | undefined,
  pagination: { start: number; end: number },
  onFetchComplete: (
    newSightings: PetSighting[],
    error: string | null,
    pagination?: SightingPagination,
  ) => void,
) => {
  if (!location) {
    return;
  }

  fetchSightingsByUserWithLocation(location, pagination, onFetchComplete);
};

const fetchSightingsWithLocation = async (
  location: SightingLocation,
  pagination: { start: number; end: number },
  onFetchComplete: (
    newSightings: PetSighting[],
    error: string | null,
    pagination?: SightingPagination,
  ) => void,
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
    .from("aggregated_sightings")
    .select("*")
    .eq("is_active", true)
    .gte("last_seen_lat", minLat)
    .lte("last_seen_lat", maxLat)
    .gte("last_seen_long", minLng)
    .lte("last_seen_long", maxLng)
    .order("updated_at", { ascending: false })
    .range(pagination.start, pagination.end);

  if (error) {
    log(error.message);
    onFetchComplete([], "An error occurred while fetching sightings.");
  } else {
    onFetchComplete(data || [], null, pagination);
  }
};

const fetchSightingsByUserWithLocation = async (
  location: SightingLocation,
  pagination: { start: number; end: number },
  onFetchComplete: (
    newSightings: PetSighting[],
    error: string | null,
    pagination?: SightingPagination,
  ) => void,
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
    .from("aggregated_sightings")
    .select("*")
    .eq("is_active", true)
    .gte("last_seen_lat", minLat)
    .lte("last_seen_lat", maxLat)
    .gte("last_seen_long", minLng)
    .lte("last_seen_long", maxLng)
    .order("updated_at", { ascending: false })
    .range(pagination.start, pagination.end);

  if (error) {
    log(error.message);
    onFetchComplete([], "An error occurred while fetching sightings.");
  } else {
    onFetchComplete(data || [], null, pagination);
  }
};
