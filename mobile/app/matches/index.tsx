import { FindMatch } from "@/components/wizard/find-match";
import { useLocalSearchParams } from "expo-router";

export default function Matches() {
  const { sightingId } = useLocalSearchParams<{
    sightingId: string;
  }>();
  return (
    <>Please login to see matches</>
  );
}
