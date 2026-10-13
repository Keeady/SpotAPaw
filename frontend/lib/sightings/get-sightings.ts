import { cacheLife } from "next/cache";

export async function getSightings() {
  const host = process.env.API_HOST;
  const port = process.env.API_PORT;
  if (!host || !port) {
    return;
  }

  try {
    const res = await fetch(`${host}:${port}/sightings`);
    if (!res.ok) {
      throw new Error("Failed to fetch bio");
    }
    // return res.json();
    return [
      {
        id: "64b84c63-fde8-4d7e-b9f8-3fdff809be94",
        created_at: "2026-08-21T18:29:29.986909+00:00",
        linked_sighting_id: "781c15fb-f129-411f-81c2-0bd710eeaa91",
        is_active: true,
        name: "Buddy",
        type: "Dog",
        breed: "Golden Retriever",
        species: "Canis familiaris",
        lastSeenAt: "2026-10-11T18:30:00Z",
        distanceMiles: 1.2,
        colors: ["Golden", "White"],
        gender: "male",
        age: "3 years",
        features: "Red collar, small scar over left eye.",
        photos: ["/p1.jpg", "/p2.jpg", "/p3.jpg"],
      },
      {
        id: "64b84c63-fde8-4d7e-b9f8-3fdff809be95",
        created_at: "2026-08-21T18:29:29.986909+00:00",
        linked_sighting_id: "781c15fb-f129-411f-81c2-0bd710eeaa91",
        is_active: true,
        name: "Buddy",
        type: "Dog",
        breed: "Golden Retriever",
        species: "Canis familiaris",
        lastSeenAt: "2026-10-11T18:30:00Z",
        distanceMiles: 1.2,
        colors: ["Golden", "White"],
        gender: "male",
        age: "3 years",
        features: "Red collar, small scar over left eye.",
        photos: ["/p1.jpg"],
      },
      {
        id: "64b84c63-fde8-4d7e-b9f8-3fdff809be96",
        created_at: "2026-08-21T18:29:29.986909+00:00",
        linked_sighting_id: "781c15fb-f129-411f-81c2-0bd710eeaa91",
        is_active: true,
        name: "Buddy",
        type: "Dog",
        breed: "Golden Retriever",
        species: "Canis familiaris",
        lastSeenAt: "2026-10-11T18:30:00Z",
        distanceMiles: 1.2,
        colors: ["Golden", "White"],
        gender: "male",
        age: "3 years",
        features: "Red collar, small scar over left eye.",
        photos: [],
      }
    ];
  } catch (error) {
    console.error(error);
    return [];
  }
}
