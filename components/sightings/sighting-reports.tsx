import React, { useState, useEffect, useCallback, useContext } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  Image,
  Platform,
} from "react-native";
import {
  Card,
  Text,
  Chip,
  ActivityIndicator,
  Surface,
  useTheme,
} from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContext } from "../Provider/auth-provider";
import { useRouter } from "expo-router";
import { log } from "../logs";
import { createErrorLogMessage, isValidUuid } from "../util";
import { SightingRepository } from "@/db/repositories/sighting-repository";
import { AggregatedSighting } from "@/db/models/sighting";
import { showMessage } from "react-native-flash-message";
import { useTranslation } from "react-i18next";

const GUEST_REPORTS_KEY = "@guest_reports";

const ReportListPage = () => {
  const { t } = useTranslation(["sightingpage", "translation"]);
  const router = useRouter();
  const theme = useTheme();
  const [reports, setReports] = useState<AggregatedSighting[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useContext(AuthContext);
  const userId = user?.id;
  const isGuest = !userId;

  // Fetch reports from Supabase (authenticated users)
  const fetchReportsFromSupabase = useCallback(async () => {
    if (!userId) {
      return [];
    }

    const repository = new SightingRepository();
    return await repository.getSightingsByReporter(userId);
  }, [userId]);

  // Fetch reports from AsyncStorage (guest users)
  const fetchReportsFromStorage = useCallback(async () => {
    try {
      const storedReports = await AsyncStorage.getItem(GUEST_REPORTS_KEY);
      return storedReports ? JSON.parse(storedReports) : [];
    } catch (error) {
      const message = createErrorLogMessage(error);
      log(`Error fetching reports from AsyncStorage: ${message}`);
      return [];
    }
  }, []);

  // Main fetch function
  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const data = isGuest
        ? await fetchReportsFromStorage()
        : await fetchReportsFromSupabase();

      if (data && data.length > 0) {
        setReports(data);
      }
    } catch (error) {
      const message = createErrorLogMessage(error);
      log(`Error fetching reports: ${message}`);
    } finally {
      setLoading(false);
    }
  }, [fetchReportsFromSupabase, isGuest, fetchReportsFromStorage]);

  // Pull to refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchReports();
    setRefreshing(false);
  }, [fetchReports]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get status color
  const getStatusColor = (status: boolean) => {
    return status === true ? theme.colors.primary : "green";
  };

  const fetchSightingByLinkedId = useCallback(
    async (linkedSightingId: string) => {
      const repository = new SightingRepository();
      return repository.getSightingByLinkedSightingId(linkedSightingId);
    },
    [],
  );

  const onNavigateReport = (isActive: boolean, linkedSightingId: string) => {
    if (isActive) {
      if (!isValidUuid(linkedSightingId)) {
        log(`Report: Invalid linkedSightingId: ${linkedSightingId}`);
        showMessage({
          message: t("error", "Error", { ns: "translation" }),
          description: t(
            "anErrorOccurredPleaseTryAgain",
            "An error occurred. Please try again.",
            { ns: "translation" },
          ),
          type: "warning",
          icon: "warning",
          statusBarHeight: 50,
        });
        return;
      }

      setLoading(true);
      // fetch the sighting by linkedSightingId to get the actual sightingId
      fetchSightingByLinkedId(linkedSightingId)
        .then((sighting) => {
          if (!sighting) {
            showMessage({
              message: t("error", "Error", { ns: "translation" }),
              description: t(
                "sightingReportNotFound",
                "Sighting report not found.",
              ),
              type: "warning",
              icon: "warning",
              statusBarHeight: 50,
            });
            return;
          }

          router.navigate(
            `/(app)/my-sightings/${sighting.id}/?linkedSightingId=${linkedSightingId}&petId=${sighting.petId}`,
          );
        })
        .catch((error) => {
          const errorMessage = createErrorLogMessage(error);
          log(`Report: Failed to fetch sighting: ${errorMessage}`);
          showMessage({
            message: t("error", "Error", { ns: "translation" }),
            description: t(
              "failedToNavigateToSightingDetails",
              "Failed to navigate to sighting details.",
            ),
            type: "warning",
            icon: "warning",
            statusBarHeight: 50,
          });
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  // Render individual report item
  const renderReportItem = ({ item }: { item: AggregatedSighting }) => (
    <Card
      style={styles.card}
      mode="elevated"
      onPress={() =>
        onNavigateReport(item.isActive, item.linkedSightingId ?? item.id)
      }
    >
      <View style={styles.cardContent}>
        {/* Thumbnail */}
        <Surface style={styles.thumbnailContainer} elevation={1}>
          {item.photo ? (
            <Image
              source={{ uri: item.photo }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
          ) : (
            <View
              style={[
                styles.thumbnail,
                { justifyContent: "center", alignItems: "center" },
              ]}
            >
              <Text>{t("noPhoto", "No Photo")}</Text>
            </View>
          )}
        </Surface>

        {/* Report Details */}
        <View style={styles.detailsContainer}>
          <View style={styles.headerRow}>
            <Text variant="titleMedium" style={styles.reportType}>
              {t(`animal.${item.species}`, item.species, { ns: "translation" })}
            </Text>
            <Chip
              mode="flat"
              textStyle={[styles.chipText, { color: theme.colors.onPrimary }]}
              style={[
                styles.statusChip,
                { backgroundColor: getStatusColor(item.isActive) },
              ]}
            >
              {item.isActive
                ? t("active", "ACTIVE")
                : t("resolved", "RESOLVED")}
            </Chip>
          </View>

          <Text variant="bodySmall" style={styles.date}>
            {formatDate(item.createdAt)}
          </Text>

          {item.features && (
            <Text
              variant="bodySmall"
              numberOfLines={2}
              style={styles.description}
            >
              {item.features}
            </Text>
          )}
        </View>
      </View>
    </Card>
  );

  // Empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text variant="titleMedium" style={styles.emptyText}>
        {t("noSightingReportsFound", "No sighting reports found")}
      </Text>
      <Text variant="bodyMedium" style={styles.emptySubtext}>
        {isGuest
          ? t("yourReportsWillAppearHere", "Your reports will appear here")
          : t(
              "startCreatingSightingsToSeeThemHere",
              "Start creating sightings to see them here",
            )}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>
          {t("loadingReports", "Loading reports...")}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Text style={styles.headerTitle}>{t("myReports", "My Reports")}</Text>
        <Text style={styles.headerSubtitle}>
          {t(
            "thankYouForHelpingOurFurryFriends",
            "Thank you for helping our furry friends!",
          )}
        </Text>
      </View>
      <FlatList
        data={reports}
        renderItem={renderReportItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  card: {
    marginBottom: 16,
    backgroundColor: "white",
  },
  cardContent: {
    flexDirection: "row",
    padding: 12,
  },
  thumbnailContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#e0e0e0",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  detailsContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  reportType: {
    fontWeight: "600",
    flex: 1,
    marginRight: 8,
  },
  statusChip: {
    // height: 24,
  },
  chipText: {
    fontSize: 11,
    fontWeight: "600",
  },
  date: {
    color: "#666",
    marginBottom: 4,
  },
  description: {
    color: "#888",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    marginBottom: 8,
    color: "#666",
  },
  emptySubtext: {
    color: "#999",
  },
  header: {
    backgroundColor: "#714ea9ff",
    paddingVertical: 16,
    paddingTop: Platform.OS === "ios" ? 50 : 16,
    alignItems: "center",
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#BBDEFB",
    marginTop: 4,
  },
});

export default ReportListPage;
