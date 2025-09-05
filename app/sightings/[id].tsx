import { router, useLocalSearchParams } from "expo-router";
import { useCallback } from "react";
import { showMessage } from "react-native-flash-message";
import SightingDetail from "@/components/sightings/sighting-details";
import { usePetSightings } from "@/components/sightings/use-sighting-details";

export default function SightingProfile() {
  const { id } = useLocalSearchParams(); // pet id
  const { loading, error, timeline, summary } = usePetSightings(id);

  const onAddTimeline = useCallback((sightingId: string) => {
    router.navigate(`/sightings/new/?id=${sightingId}&petId=${id}`);
  }, []);

  if (error) {
    showMessage({
      message: "Error fetching sighting info. Please try again.",
      type: "warning",
      icon: "warning",
    });
    return;
  }

  if (!timeline || timeline.length === 0 || loading) {
    return null;
  }

  return SightingDetail({
    sightings: timeline,
    pet: summary,
    onEdit: onAddTimeline,
  });
}
