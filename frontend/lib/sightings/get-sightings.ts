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
    return res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}
