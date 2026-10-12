import { getSightings } from "@/lib/sightings/get-sightings";

type Sighting = {
  sighting_id: string;

}
export default async function Home() {
  const sightings: Sighting[] = await getSightings();

  return (
    <main className="flex min-h-screen flex-col items-center justify-between border-t-[3px] border-[#7a2a16] bg-white px-6 pb-8 font-sans text-neutral-900">
      <section className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
        {sightings && sightings.map((s: Sighting) => (
          <>s.sighting_id</>
        ))}
      </section>
    </main>
  );
}
