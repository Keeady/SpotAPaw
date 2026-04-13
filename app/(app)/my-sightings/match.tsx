import { FindMatch } from "@/components/wizard/find-match";
import { useLocalSearchParams } from "expo-router";

export default function Match() {
  const { sightingId, petDescriptionId } = useLocalSearchParams<{
    sightingId: string;
    petDescriptionId: string;
  }>();
  return (
    <FindMatch
      sightingFormData={{ sightingId, petDescriptionId } as any}
      updateSightingData={() => void 0}
      loading={false}
      setReportType={() => void 0}
    />
  );
}
