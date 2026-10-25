import { ShowMatches } from "@/components/sightings/find-match";
import { useLocalSearchParams } from "expo-router";

export default function Matches() {
  const { sightingId, petDescriptionId } = useLocalSearchParams<{
    sightingId: string;
    petDescriptionId: string;
  }>();
  return <ShowMatches sightingId={sightingId} petDescriptionId={petDescriptionId}/>;
}
