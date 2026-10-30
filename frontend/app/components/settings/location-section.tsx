"use client";

import { LocateFixed, MapPin, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button, SettingsItem, SettingsSection } from "./utils";

export type Coordinates = { latitude: number; longitude: number };

type LocationPermission = "checking" | "granted" | "denied" | "prompt" | "unsupported";

type LocationSectionProps = {
  /** Manually selected / last known coordinates, used when device location is off. */
  fallbackLocation?: Coordinates;
  /** Name of the cookie that stores the manually selected location. */
  savedLocationCookie?: string;
  /** Called after the saved-location cookie has been cleared. */
  onReset?: () => void;
  /** Override the default reverse geocoder (coordinates -> "City, Region"). */
  reverseGeocode?: (
    coords: Coordinates,
    signal: AbortSignal,
  ) => Promise<string>;
};

async function defaultReverseGeocode(
  { latitude, longitude }: Coordinates,
  signal: AbortSignal,
) {
  const res = await fetch(
    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
    { signal },
  );
  if (!res.ok) throw new Error("Reverse geocoding failed");
  const data = await res.json();
  const place = [data.city || data.locality, data.principalSubdivision]
    .filter(Boolean)
    .join(", ");
  if (!place) throw new Error("No place found");
  return place;
}

export default function LocationSection({
  fallbackLocation,
  savedLocationCookie = "saved_location",
  onReset,
  reverseGeocode,
}: LocationSectionProps) {
  const [permission, setPermission] = useState<LocationPermission>("checking");
  const [requesting, setRequesting] = useState(false);
  const [city, setCity] = useState<string | null>(null);
  const [cityStatus, setCityStatus] = useState<"idle" | "loading" | "error">(
    "idle",
  );
  const [resetDone, setResetDone] = useState(false);

  const geocodeRef = useRef(reverseGeocode ?? defaultReverseGeocode);
  geocodeRef.current = reverseGeocode ?? defaultReverseGeocode;

  // Track the browser's geolocation permission, including later changes.
  useEffect(() => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setPermission("unsupported");
      return;
    }
    if (!navigator.permissions?.query) {
      setPermission("prompt");
      return;
    }

    let status: PermissionStatus | undefined;
    let cancelled = false;
    const sync = () => {
      if (status) setPermission(status.state);
    };

    navigator.permissions
      .query({ name: "geolocation" })
      .then((s) => {
        if (cancelled) return;
        status = s;
        setPermission(s.state);
        s.addEventListener("change", sync);
      })
      .catch(() => setPermission("prompt"));

    return () => {
      cancelled = true;
      status?.removeEventListener("change", sync);
    };
  }, []);

  // Resolve the city name when we are not using the device location.
  const latitude = fallbackLocation?.latitude;
  const longitude = fallbackLocation?.longitude;
  useEffect(() => {
    if (permission === "checking" || permission === "granted") return;
    if (latitude === undefined || longitude === undefined) return;

    const controller = new AbortController();
    setCityStatus("loading");
    geocodeRef
      .current({ latitude, longitude }, controller.signal)
      .then((place) => {
        setCity(place);
        setCityStatus("idle");
      })
      .catch((error) => {
        if (error?.name === "AbortError") return;
        setCityStatus("error");
      });

    return () => controller.abort();
  }, [permission, latitude, longitude]);

  // Briefly show "Cleared" after resetting.
  useEffect(() => {
    if (!resetDone) return;
    const timer = setTimeout(() => setResetDone(false), 2000);
    return () => clearTimeout(timer);
  }, [resetDone]);

  const requestPermission = () => {
    setRequesting(true);
    navigator.geolocation.getCurrentPosition(
      () => {
        setPermission("granted");
        setRequesting(false);
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) setPermission("denied");
        setRequesting(false);
      },
      { timeout: 10000 },
    );
  };

  const handleReset = () => {
    document.cookie = `${savedLocationCookie}=; Max-Age=0; path=/; SameSite=Lax`;
    onReset?.();
    setResetDone(true);
  };

  const granted = permission === "granted";

  const permissionDescription =
    permission === "checking"
      ? "Checking…"
      : permission === "unsupported"
        ? "Not supported on this device"
        : granted
          ? "Enabled"
          : permission === "denied"
            ? "Disabled · Blocked in your browser settings"
            : "Disabled";

  let currentLocation: string;
  if (granted) {
    currentLocation = "Using device location";
  } else if (permission === "checking") {
    currentLocation = "Checking…";
  } else if (!fallbackLocation) {
    currentLocation = "No location set";
  } else if (cityStatus === "loading") {
    currentLocation = "Finding city…";
  } else if (cityStatus === "error" || !city) {
    currentLocation = "Unknown location";
  } else {
    currentLocation = city;
  }

  return (
    <SettingsSection title="Location">
      <SettingsItem
        icon={MapPin}
        tone="blue"
        title="Location Permission"
        description={permissionDescription}
        trailing={
          granted ? (
            <span className="text-sm font-medium text-emerald-600">
              Granted
            </span>
          ) : permission === "checking" || permission === "unsupported" ? null : (
            <Button
              size="sm"
              onClick={requestPermission}
              disabled={requesting}
            >
              {requesting ? "Requesting…" : "Request"}
            </Button>
          )
        }
      />

      <SettingsItem
        icon={LocateFixed}
        tone="emerald"
        title="Current Location"
        description={currentLocation}
      />

      <SettingsItem
        icon={RotateCcw}
        tone="amber"
        title="Reset Saved Location"
        description="Remove your manually selected location"
        trailing={
          <Button
            size="sm"
            variant="secondary"
            onClick={handleReset}
            disabled={resetDone}
          >
            {resetDone ? "Cleared" : "Reset"}
          </Button>
        }
      />
    </SettingsSection>
  );
}
