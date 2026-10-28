import { SightingLocation } from "@/app/components/location/location-types";
import { Match } from "@/lib/matches/sighting-match";
import { toPercent } from "@/lib/matches/util";
import SightingCard from "../aggregated-sightings/sighting-card";

type Props = {
  match: Match;
  currentLocation?: SightingLocation;
};

export function MatchCard({ match, currentLocation }: Props) {
  const s = match.sighting;
  if (!s) return null;

  const pct = toPercent(match.score);

  const params = new URLSearchParams();
  if (s.linkedSightingId) params.set("linkedSightingId", s.linkedSightingId);
  if (s.linkedSightingId && s.petId) params.set("petId", s.petId);
  const qs = params.toString();
  const href = `/sightings/${s.id}${qs ? `?${qs}` : ""}`;

  return (
    <div className="relative">
      <SightingCard
        sighting={s}
        href={href}
        currentLocation={currentLocation}
      />
      {pct !== null && (
        <span
          className={`absolute right-4 top-4 rounded-full px-3 py-1.5 text-sm font-semibold shadow-sm sm:right-5 sm:top-5 ${
            pct >= 90
              ? "bg-[#4caf50] text-white"
              : "bg-[#c7ebc8] text-neutral-900"
          }`}
          aria-label={`${pct}% match`}
        >
          {pct}%
        </span>
      )}
    </div>
  );
}
