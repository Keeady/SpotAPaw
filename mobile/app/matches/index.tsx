import { ShowMatches } from "@/components/sightings/find-match";
import { useLocalSearchParams } from "expo-router";

export default function Matches() {
  const { sightingId } = useLocalSearchParams<{
    sightingId: string;
  }>();
  return <ShowMatches sightingId={sightingId} />;
}
