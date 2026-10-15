import { Suspense } from "react";
import SightingList from "./sighting-list";

export default async function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between border-t-[3px] border-[#7a2a16] bg-white px-6 pb-8 font-sans text-neutral-900">
      <section className="flex flex-1 flex-col items-center justify-center gap-6 text-center w-full">
        <Suspense fallback={<p>Loading sightings...</p>}>
          <SightingList />
        </Suspense>
      </section>
    </main>
  );
}
