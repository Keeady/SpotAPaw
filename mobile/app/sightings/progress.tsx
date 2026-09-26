import ShowProgress from "@/components/wizard/show-progress";
import { useLocalSearchParams } from "expo-router";

export default function Progress() {
  const { sightingId } = useLocalSearchParams<{
    sightingId: string;
  }>();
  return <ShowProgress sightingId={sightingId} />;
}
