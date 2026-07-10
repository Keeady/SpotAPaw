import SightingPoster from "@/components/sightings/poster-profile";
import { GeneratePoster } from "@/components/wizard/generate-poster";
import { useLocalSearchParams } from "expo-router";

export default function PosterById() {
    const { id: posterId } = useLocalSearchParams<{
        id: string;
      }>();
      return <SightingPoster id={posterId} />;
}
