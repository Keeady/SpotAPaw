import { Suspense } from "react";
import PetList from "./pet-list";

export default function MyPets() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between border-t-[3px] border-[#7a2a16] bg-white px-6 pb-8 font-sans text-neutral-900">
      <section className="flex w-full max-w-5xl flex-1 flex-col items-center justify-start gap-6 text-start">
        <Suspense><PetList /></Suspense>
      </section>
    </main>
  );
}
