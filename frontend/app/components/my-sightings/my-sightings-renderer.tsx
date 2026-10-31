import { Sighting } from "@/lib/sightings/sighting";
import { MySightingCard } from "./my-sighting-card";
import { useCallback } from "react";
import { useRouter } from "next/navigation";

export default function MySightingsRenderer({
  sightings,
  isGuest,
}: {
  sightings: Sighting[];
  isGuest: boolean;
}) {
  return (
    <div className="flex grow flex-col gap-3">
      {sightings?.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <p className="text-base font-medium text-neutral-600">
            No sighting reports found
          </p>
          <p className="text-sm text-neutral-500">
            {"Your reports will appear here. Start creating sightings to see them here."}
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {sightings.map((sighting) => (
            <li key={sighting.id}>
              <MySightingCard
                sighting={sighting}
                disabled={true}
              />
            </li>
          ))}
        </ul>
      )}
      
    </div>
  );
}
