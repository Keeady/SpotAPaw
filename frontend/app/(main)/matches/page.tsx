import { Suspense } from "react";
import { MatchesList } from "./match-list";

export default async function MatchesPage({
  searchParams,
}: {
  searchParams: Promise<{ sightingId: string }>;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between border-t-[3px] border-[#7a2a16] bg-white px-6 pb-8 font-sans text-neutral-900">
      <section className="flex w-full max-w-5xl flex-1 flex-col items-center justify-center gap-6">
        <Suspense fallback="loading matches">
          <MatchesList searchParams={searchParams} />
        </Suspense>
      </section>
    </main>
  );
}
