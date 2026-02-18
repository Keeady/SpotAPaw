import { useCallback, useContext, useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Button, IconButton, Portal } from "react-native-paper";
import { SightingLocation } from "../get-current-location";
import { supabase } from "../supabase-client";
import { JSX } from "react/jsx-runtime";
import { PetSighting } from "@/model/sighting";
import { AuthContext } from "../Provider/auth-provider";
import { MAX_SIGHTINGS, SIGHTING_RADIUSKM } from "../constants";
import { EmptySighting } from "@/components/sightings/empty-sighting";
import ReportLostPetFab from "./report-fab";
import { useRouter } from "expo-router";
import { log } from "../logs";
import { PermissionContext } from "../Provider/permission-provider";

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
  const { user } = useContext(AuthContext);
  const [pagination, setPagination] = useState({
    start: 0,
    end: MAX_SIGHTINGS,
  });
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const { location, isLoadingLocation } = useContext(PermissionContext);

  const onFetchComplete = useCallback(
    (
      newSightings: PetSighting[],
      error: string | null,
      pagination: SightingPagination,
    ) => {
      if (error) {
        setError(error);
      } else if (pagination.start === 0) {
        setSightings(newSightings);
      } else if (newSightings.length > 0) {
        setSightings((prev) => [...prev, ...newSightings]);
      }
      setLoading(false);
      setRefreshing(false);
      setPagination(pagination);
    },
    [],
  );

  const fetch = useCallback(
    (
      location: SightingLocation | undefined,
      pagination: SightingPagination,
    ) => {
      setLoading(true);
      if (user) {
        fetchSightingsByUser(location, pagination, onFetchComplete);
      } else {
        fetchSightings(location, pagination, onFetchComplete);
      }
    },
    [user, onFetchComplete],
  );

  // Refetch when filter changes
  useEffect(() => {
    if (isLoadingLocation) {
      return;
    }

    const pagination = { start: 0, end: MAX_SIGHTINGS };

    fetch(location, pagination);
  }, [fetch, location, isLoadingLocation]);

  const onEndReached = useCallback(() => {
    if (loading) {
      return;
    }

    fetch(location, {
      start: pagination.end + 1,
      end: pagination.end + MAX_SIGHTINGS,
    });
  }, [location, pagination, loading, fetch]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetch(location, { start: 0, end: MAX_SIGHTINGS });
  }, [fetch, location]);

  const ListEmptyComponent = useCallback(() => {
    if (loading) {
      return <></>;
    }
    return <EmptySighting error={error} hasLocation={!!location} />;
  }, [error, location, loading]);

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
          {loading ? (
            <ActivityIndicator size="small" />
          ) : user ? (
            ""
          ) : (
            <IconButton
              icon={"cog"}
              size={20}
              onPress={() => router.navigate("/settings")}
            />
          )}
        </View>
        <View style={{ flex: 1 }}>
          {renderer(
            sightings,
            onEndReached,
            ListEmptyComponent,
            onRefresh,
            refreshing,
          )}
        </View>

        <ReportLostPetFab
          onFormPress={() => router.navigate(`/${sightingsRoute}/new`)}
          title={"Report New Sighting"}
        />
      </View>
    </Portal.Host>
  );
}

const fetchSightings = async (
  location: SightingLocation | undefined,
  pagination: { start: number; end: number },
  onFetchComplete: (
    newSightings: PetSighting[],
    error: string | null,
    pagination: SightingPagination,
  ) => void,
) => {
  fetchSightingsWithLocation(location, pagination, onFetchComplete);
};

const fetchSightingsByUser = async (
  location: SightingLocation | undefined,
  pagination: { start: number; end: number },
  onFetchComplete: (
    newSightings: PetSighting[],
    error: string | null,
    pagination: SightingPagination,
  ) => void,
) => {
  fetchSightingsByUserWithLocation(location, pagination, onFetchComplete);
};

const fetchSightingsWithLocation = async (
  location: SightingLocation | undefined,
  pagination: { start: number; end: number },
  onFetchComplete: (
    newSightings: PetSighting[],
    error: string | null,
    pagination: SightingPagination,
  ) => void,
) => {
  if (!location) {
    return onFetchComplete([], null, pagination);
  }

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
    onFetchComplete(
      [],
      "An error occurred while fetching sightings.",
      pagination,
    );
  } else {
    onFetchComplete(data || [], null, pagination);
  }
};

const fetchSightingsByUserWithLocation = async (
  location: SightingLocation | undefined,
  pagination: { start: number; end: number },
  onFetchComplete: (
    newSightings: PetSighting[],
    error: string | null,
    pagination: SightingPagination,
  ) => void,
) => {
  if (!location) {
    return onFetchComplete([], null, pagination);
  }

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
    onFetchComplete(
      [],
      "An error occurred while fetching sightings.",
      pagination,
    );
  } else {
    onFetchComplete(data || [], null, pagination);
  }
};
