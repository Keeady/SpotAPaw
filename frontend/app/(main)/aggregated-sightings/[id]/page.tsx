import { Suspense } from "react";
import SightingById from "./sighting-by-id";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ linkedSightingId: string }>;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between border-t-[3px] border-[#7a2a16] bg-white px-6 pb-8 font-sans text-neutral-900">
      <section className="flex w-full max-w-5xl flex-1 flex-col items-center justify-center gap-6">
        <Suspense fallback={<p>Loading sighting details...</p>}>
          <SightingById params={params} searchParams={searchParams} />
        </Suspense>
      </section>
    </main>
  );
}
