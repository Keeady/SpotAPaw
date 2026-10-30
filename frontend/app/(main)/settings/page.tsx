import { Suspense } from "react";
import Settings from "./settings";

export default function SettingsPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between border-t-[3px] border-[#7a2a16] bg-white px-6 pb-8 font-sans text-neutral-900">
      <section className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
        <Suspense>
          <Settings />
        </Suspense>
      </section>
    </main>
  );
}
