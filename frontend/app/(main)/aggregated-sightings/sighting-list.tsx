import { getAggregatedSightings } from "@/lib/sightings/get-aggregated-sightings";
import SightingCard from "./sighting-card";
import { AggregatedSighting } from "@/lib/sightings/agregated-sighting";

export default async function SightingList() {
  const sightings: AggregatedSighting[] | undefined = await getAggregatedSightings();
  console.log(sightings)
  if (!sightings || sightings.length === 0) {
    return <p>No Sightings</p>;
  }

  return (
    <ul>
      {sightings.map((s: AggregatedSighting) => (
        <li key={s.id} className="pt-4">
          <SightingCard sighting={s} />
        </li>
      ))}
    </ul>
  );
}
