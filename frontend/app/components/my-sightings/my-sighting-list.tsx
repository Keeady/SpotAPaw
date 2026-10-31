"use client";

import { useState } from "react";
import MySightingsRenderer from "./my-sightings-renderer";
import { Sighting } from "@/lib/sightings/agregated-sighting";
import { getGuestSightings } from "@/lib/sightings/get-guest-sightings";

export default function MySightings({
  sightings,
  isGuest,
}: {
  sightings: Sighting[];
  isGuest: boolean;
}) {
  let guestSightings: Sighting[] = [];
  const [error, setError] = useState("");
  if (isGuest) {
    getGuestSightings()
      .then(({ data }) => {
        if (data) {
          guestSightings = data;
        }
      })
      .catch(() => {
        setError("Failed to fetch sightings");
      });
  }

  return (
    <div className="flex grow flex-col">
      <div className="flex flex-1 flex-col self-start self-stretch py-2 mb-4">
        {error && (
          <p className="text-m font-medium py-2 text-red-700 bg-red-50">
            {error}
          </p>
        )}
      </div>

      <MySightingsRenderer
        sightings={[...sightings, ...guestSightings]}
        isGuest={isGuest}
      />
    </div>
  );
}
