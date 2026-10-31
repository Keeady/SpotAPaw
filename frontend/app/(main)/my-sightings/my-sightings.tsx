import MySightingList from "@/app/components/my-sightings/my-sighting-list";
import { getMySightings } from "@/lib/sightings/get-my-sightings";

export default async function MySightingsPage() {
  let isGuest = false;
  const { data, error, errorCode } = await getMySightings();

  if (errorCode === "NOT_AUTHENTICATED") {
    isGuest = true;
  }

  if (!data || error) {
    const message = "Something went wrong.";
    return (
      <div className="flex flex-col px-3 w-full">
        <p className="my-10 self-center text-sm text-neutral-600 dark:text-neutral-400">
          {message}
        </p>
      </div>
    );
  }

  return (
    <div className="flex w-full grow flex-col px-3 items-start justify-start text-start">
      <MySightingList sightings={data || []} isGuest />
    </div>
  );
}
