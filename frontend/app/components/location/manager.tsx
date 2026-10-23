"use client";

import { Crosshair, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { useCallback, useContext, useState } from "react";
import Divider from "../divider";
import type { SightingLocation } from "./location-types";

// Leaflet touches `window`, so the map must only render on the client.
const DropPinOnMap = dynamic(() => import("./drop-pin-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[350px] w-full items-center justify-center rounded-xl bg-[#F7F2FA]">
      <Loader2 className="h-6 w-6 animate-spin text-[#6750A4]" />
    </div>
  ),
});

type SightingLocationManagerProps = {
  /** Called whenever the user picks a location (GPS or manual pin). */
  onLocationSelected?: (location: SightingLocation) => void;
};

export function SightingLocationManager({
  onLocationSelected,
}: SightingLocationManagerProps) {
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<SightingLocation>();

  const onNewLocationSelected = useCallback(
    (loc?: SightingLocation) => {
      if (!loc) return;
      setLocation?.(loc);
      onLocationSelected?.(loc);
    },
    [onLocationSelected],
  );

  const refreshPermission = useCallback(async () => {
    setLocating(true);
    (navigator.geolocation.getCurrentPosition((pos) => {
      setLocating(false);
      if (pos) {
        setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        onNewLocationSelected({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      } else {
        setError("Failed to get location. Please try again.");
      }
    }),
      () => {
        setError("Failed to get location. Please try again.");
      });
  }, []);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col px-6 pb-12 pt-6">
      <h1 className="mb-3 text-center text-2xl font-medium text-[#1D1B20]">
        Set Your Location
      </h1>

      <section className="flex flex-col items-center gap-2 px-2 py-1">
        <p className="text-center text-sm font-medium text-[#49454F]">
          To show you nearby pet sightings, we need to know your location.
        </p>
        <button
          type="button"
          onClick={refreshPermission}
          disabled={locating}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#6750A4] px-6 py-2.5 text-sm font-medium text-white transition hover:bg-[#5a4491] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6750A4] focus-visible:ring-offset-2 disabled:opacity-60"
        >
          {locating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Crosshair className="h-4 w-4" />
          )}
          Use My Current Location
        </button>
        {error && (
          <p role="alert" className="text-center text-sm text-red-600">
            {error}
          </p>
        )}
      </section>

      <Divider label="or" />

      <section className="flex flex-col items-center gap-2 px-2 py-1">
        <p className="text-center text-sm font-medium text-[#49454F]">
          Choose Location Manually
        </p>
        <DropPinOnMap
          currentLocation={location}
          handleActionButton={onNewLocationSelected}
        />
      </section>
    </main>
  );
}
