"use server";

import { SightingLocation } from "@/app/components/location/location-types";
import { SIGHTING_LOCATION_KEY } from "@/app/components/location/location-utils";
import { cookies } from "next/headers";

export async function saveSearchLocation(location: SightingLocation) {
  const { latitude, longitude } = location;
  if (
    !Number.isFinite(latitude) ||
    latitude < -90 ||
    latitude > 90 ||
    !Number.isFinite(longitude) ||
    longitude < -180 ||
    longitude > 180
  ) {
    throw new Error("Invalid coordinates");
  }

  try {
    const cookieStore = await cookies();

    cookieStore.set(
      SIGHTING_LOCATION_KEY,
      JSON.stringify({ latitude, longitude }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
      },
    );
  } catch (error) {
    console.error(error);
  }
}

export async function getSavedSearchLocation() {
  try {
    const cookieStore = await cookies();
    const savedLocation = cookieStore.get(SIGHTING_LOCATION_KEY);
    if (savedLocation?.value && savedLocation.value.length > 0) {
      return JSON.parse(savedLocation.value);
    }
  } catch (error) {
    console.error(error);
  }
}

export async function resetSavedSearchLocation() {
  try {
    const cookieStore = await cookies();
    cookieStore.set(SIGHTING_LOCATION_KEY, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });
  } catch (error) {
    console.error(error);
  }
}
