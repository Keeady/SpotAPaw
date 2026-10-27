import SightingPoster from "@/components/sightings/poster-profile";
import { GeneratePoster } from "@/components/wizard/generate-poster";
import { useLocalSearchParams } from "expo-router";

export default function Poster() {
  const { sightingId } = useLocalSearchParams<{
    sightingId: string;
  }>();
  return <SightingPoster id={""} sightingId={sightingId} />
}
