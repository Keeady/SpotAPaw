import SightingPoster from "@/components/sightings/poster-profile";
import { useLocalSearchParams } from "expo-router";

export default function Poster() {
  const { sightingId } = useLocalSearchParams<{
    sightingId: string;
  }>();
  return <SightingPoster id={""} sightingId={sightingId} />
}
