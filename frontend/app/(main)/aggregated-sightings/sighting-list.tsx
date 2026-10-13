import { getSightings } from "@/lib/sightings/get-sightings";
import SightingCard from "./sighting-card";
import type { Sighting } from "./sighting-card";

export default async function SightingList() {
  const sightings: Sighting[] | undefined = await getSightings();
  console.log(sightings)
  if (!sightings || sightings.length === 0) {
    return <p>No Sightings</p>;
  }

  return (
    <ul>
      {sightings.map((s: Sighting) => (
        <li key={s.id} className="pt-4">
          <SightingCard sighting={s} />
        </li>
      ))}
    </ul>
  );
}
