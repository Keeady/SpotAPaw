import { GeneratePoster } from "@/components/wizard/generate-poster";
import { useLocalSearchParams } from "expo-router";

export default function Poster() {
  const { sightingId } = useLocalSearchParams<{
    sightingId: string;
  }>();
  return <>Let's find a poster for you</>;
}
