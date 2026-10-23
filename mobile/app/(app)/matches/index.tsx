import { FindMatch } from "@/components/wizard/find-match";
import { useLocalSearchParams } from "expo-router";

export default function Matches() {
  const { sightingId } = useLocalSearchParams<{
    sightingId: string;
  }>();
  return (
    <>Here are your matches</>
  );
}
