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
import { supabase } from "../supabase-client";
import { AuthContext } from "../Provider/auth-provider";
import { useRouter } from "expo-router";

interface Report {
  id: string;
  reporter_id: string | null;
  species: string;
  is_active: boolean;
  photo: string;
  created_at: string;
  features?: string;
  linked_sighting_id?: string;
}

const GUEST_REPORTS_KEY = "@guest_reports";

const ReportListPage = () => {
  const router = useRouter();
  const theme = useTheme();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useContext(AuthContext);
  const userId = user?.id;
  const isGuest = !userId;

  // Fetch reports from Supabase (authenticated users)
  const fetchReportsFromSupabase = async () => {
    try {
      const { data, error } = await supabase
        .from("sightings")
        .select("*")
        .eq("reporter_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching reports from Supabase:", error);
      return [];
    }
  };

  // Fetch reports from AsyncStorage (guest users)
  const fetchReportsFromStorage = async () => {
    try {
      const storedReports = await AsyncStorage.getItem(GUEST_REPORTS_KEY);
      return storedReports ? JSON.parse(storedReports) : [];
    } catch (error) {
      console.error("Error fetching reports from AsyncStorage:", error);
      return [];
    }
  };

  // Main fetch function
  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = isGuest
        ? await fetchReportsFromStorage()
        : await fetchReportsFromSupabase();
      setReports(data);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  // Pull to refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchReports();
    setRefreshing(false);
  }, [isGuest, userId]);

  useEffect(() => {
    fetchReports();
  }, [userId]);

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

  const onNavigateReport = (is_active: boolean, sightingId: string) => {
    if (is_active) {
      return router.navigate(`/(app)/my-sightings/${sightingId}`);
    }
  };

  // Render individual report item
  const renderReportItem = ({ item }: { item: Report }) => (
    <Card
      style={styles.card}
      mode="elevated"
      onPress={() =>
        onNavigateReport(item.is_active, item.linked_sighting_id ?? item.id)
      }
    >
      <View style={styles.cardContent}>
        {/* Thumbnail */}
        <Surface style={styles.thumbnailContainer} elevation={1}>
          <Image
            source={{ uri: item.photo }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        </Surface>

        {/* Report Details */}
        <View style={styles.detailsContainer}>
          <View style={styles.headerRow}>
            <Text variant="titleMedium" style={styles.reportType}>
              {item.species}
            </Text>
            <Chip
              mode="flat"
              textStyle={[styles.chipText, { color: theme.colors.onPrimary }]}
              style={[
                styles.statusChip,
                { backgroundColor: getStatusColor(item.is_active) },
              ]}
            >
              {item.is_active ? "ACTIVE" : "RESOLVED"}
            </Chip>
          </View>

          <Text variant="bodySmall" style={styles.date}>
            {formatDate(item.created_at)}
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
        No reports found
      </Text>
      <Text variant="bodyMedium" style={styles.emptySubtext}>
        {isGuest
          ? "Your reports will appear here"
          : "Start creating reports to see them here"}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading reports...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Text style={styles.headerTitle}>My Reports</Text>
        <Text style={styles.headerSubtitle}>
          Thank you for helping our furry friends!
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
  guestBanner: {
    padding: 12,
    backgroundColor: "#FFF3E0",
    borderBottomWidth: 1,
    borderBottomColor: "#FFE0B2",
  },
  guestText: {
    textAlign: "center",
    color: "#E65100",
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
