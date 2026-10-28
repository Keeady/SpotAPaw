
import { Suspense } from "react";
import PosterClient from "./poster";

export default function PosterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500">
          Loading poster...
        </div>
      }
    >
      <PosterClient />
    </Suspense>
  );
}
