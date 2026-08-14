import { useCallback, useContext, useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Button, IconButton, Portal } from "react-native-paper";
import { SightingLocation } from "../get-current-location";
import { JSX } from "react/jsx-runtime";
import { AuthContext } from "../Provider/auth-provider";
import { MAX_SIGHTINGS, SIGHTING_RADIUSKM } from "../constants";
import { EmptySighting } from "@/components/sightings/empty-sighting";
import ReportLostPetFab from "./report-fab";
import { useRouter } from "expo-router";
import { PermissionContext } from "../Provider/permission-provider";
import { SightingLocationManager } from "./sighting-location-manager";
import { AggregatedSighting } from "@/db/models/sighting";
import { SightingRepository } from "@/db/repositories/sighting-repository";
import { handleAddingSighting } from "./sighting-handler";
import { log } from "../logs";
import { createErrorLogMessage } from "../util";
import { useTranslation } from "react-i18next";
import { useTelemetryProvider } from "@/instrumentation/telemetry-provider";
import type { InstrumentProps } from "@/instrumentation/telemetry-event";
import type { TelemetryEventStepStatus } from "@/db/models/telemetry";

type SightingPageProps = {
  renderer: (
    sightings: AggregatedSighting[],
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
  const { t } = useTranslation("sightingpage");
  const router = useRouter();
  const [sightings, setSightings] = useState<AggregatedSighting[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const [pagination, setPagination] = useState({
    start: 0,
    end: MAX_SIGHTINGS,
  });
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const { location, isLoadingLocation } = useContext(PermissionContext);
  const { instrument, completeInstrument } = useTelemetryProvider(); // Initialize telemetry provider to capture performance metrics

  const sightingsRoute = user ? "my-sightings" : "sightings";

  const onFetchComplete = useCallback(
    (
      newSightings: AggregatedSighting[],
      error: string | null,
      pagination: SightingPagination,
      totalCount: number,
    ) => {
      if (error) {
        setError("An error occurred while fetching sightings.");
      } else if (pagination.start === 0) {
        setSightings(newSightings);
      } else if (newSightings.length > 0) {
        setSightings((prev) => [...prev, ...newSightings]);
      }
      setLoading(false);
      setRefreshing(false);

      if (totalCount === 0) {
        setHasMore(false);
      }

      const hasMore = pagination.end < totalCount;
      setHasMore(hasMore);

      if (hasMore) {
        setPagination(pagination);
      }
    },
    [completeInstrument],
  );

  const fetch = useCallback(
    (
      location: SightingLocation | undefined,
      pagination: SightingPagination,
    ) => {
      setLoading(true);
      fetchSightingsWithLocation(
        location,
        pagination,
        onFetchComplete,
        instrument,
        completeInstrument,
      );
    },
    [onFetchComplete, instrument, completeInstrument],
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
    if (loading || error || !hasMore) {
      return;
    }

    fetch(location, {
      start: pagination.end + 1,
      end: pagination.end + MAX_SIGHTINGS,
    });
  }, [location, pagination, loading, fetch, error, hasMore]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetch(location, { start: 0, end: MAX_SIGHTINGS });
  }, [fetch, location]);

  const ListEmptyComponent = useCallback(() => {
    if (loading) {
      return <></>;
    }
    return <EmptySighting error={error} />;
  }, [error, loading]);

  const onAddSighting = useCallback(() => {
    handleAddingSighting(router, sightingsRoute, undefined, undefined);
  }, [router, sightingsRoute]);

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
              ? t("loadingNearbySightings")
              : t("showingNearbySightings")}
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
        {!location && <SightingLocationManager />}
        {location && (
          <View style={{ flex: 1 }}>
            {renderer(
              sightings,
              onEndReached,
              ListEmptyComponent,
              onRefresh,
              refreshing,
            )}
          </View>
        )}

        <ReportLostPetFab
          onFormPress={onAddSighting}
          title={t("reportNewSighting")}
          showGroup={false}
          handleShare={() => void 0}
        />
      </View>
    </Portal.Host>
  );
}

const fetchSightingsWithLocation = async (
  location: SightingLocation | undefined,
  pagination: { start: number; end: number },
  onFetchComplete: (
    newSightings: AggregatedSighting[],
    error: string | null,
    pagination: SightingPagination,
    totalCount: number,
  ) => void,
  instrument: (props: InstrumentProps) => void,
  completeInstrument: (
    props: InstrumentProps & { status: TelemetryEventStepStatus },
  ) => void,
) => {
  if (!location) {
    completeInstrument({
      eventName: "sighting_list_event",
      step: "request_sent",
      eventData: {
        count: 0,
        total_count: 0,
        error_message: "",
      },
      errorType: "missing_location",
      status: "incomplete",
    });

    return onFetchComplete([], null, pagination, 0);
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

  instrument({ eventName: "sighting_list_event", step: "request_sent", status: "success" });

  // Default: fetch all sightings
  const repository = new SightingRepository();
  repository
    .getSightings({
      minLat,
      maxLat,
      minLng,
      maxLng,
      paginationEnd: pagination.end,
      paginationStart: pagination.start,
    })
    .then(({ data, count }) => {
      onFetchComplete(data || [], null, pagination, count || 0);
      completeInstrument({
        eventName: "sighting_list_event",
        step: "request_completed",
        eventData: {
          count: data.length,
          total_count: count || 0,
          error_message: "",
        },
        errorType: undefined,
        status: "success",
      });
    })
    .catch((error) => {
      const errorMessage = createErrorLogMessage(error);
      log(
        `fetchSightingsWithLocation: Failed to fetch sightings: ${errorMessage}`,
      );
      onFetchComplete([], errorMessage, pagination, 0);
      completeInstrument({
        eventName: "sighting_list_event",
        step: "request_completed",
        eventData: {
          count: 0,
          total_count: 0,
          error_message: "",
        },
        errorType: "fetch_error",
        status: "failed",
      });
    });
};
