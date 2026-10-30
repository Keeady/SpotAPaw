import PetListRenderer from "@/app/components/pets/pet-list-renderer";
import { getMyPets } from "@/lib/pets/pet-my-pets";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function PetList() {
  const { data, error, errorCode } = await getMyPets();
  const hideCta = true;

  if (!data || error) {
    const message =
      errorCode === "NOT_AUTHENTICATED"
        ? "Please login to view your pets"
        : "Something went wrong.";
    return (
      <div className="flex flex-col px-3 w-full">
        <p className="my-10 self-center text-sm text-neutral-600 dark:text-neutral-400">
          {message}
        </p>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col px-3">
      {data.length === 0 ? (
        <p className="my-10 self-center text-sm text-neutral-600 dark:text-neutral-400">
          No pets profile to display
        </p>
      ) : (
        <PetListRenderer pets={data} />
      )}

      <div className="mx-auto w-full max-w-[900px] p-4">
        <Link
          href="/pets/new"
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#6750A4] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#5a4590] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6750A4]"
        >
          <Plus className="size-4" />
          Add a new Pet
        </Link>
      </div>
    </div>
  );
}
