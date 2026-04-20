import { formatDistanceToNow } from "date-fns";
import { SightingLocation } from "../get-current-location";
import { getDistance, convertDistance } from "geolib";

export function getLastSeenLocationDistance(
  location: SightingLocation,
  lastSeenLat: number,
  lastSeenLong: number,
) {
  const dist = getDistance(location, {
    latitude: lastSeenLat,
    longitude: lastSeenLong,
  });
  const miles = convertDistance(dist, "mi");
  if (miles > 0.1) {
    return `${miles.toFixed(1)} miles away`;
  }

  const feet = convertDistance(dist, "ft");
  return `${feet.toFixed()} feet away`;
}

export function getLastSeenTimeDistance(lastSeenTime: string) {
  if (!lastSeenTime) {
    return "";
  }

  return formatDistanceToNow(new Date(lastSeenTime), {
    addSuffix: true,
  });
}

export function getLastSeenLocationURLMap(
  lastSeenLocation: string,
  lastSeenLat: number,
  lastSeenLong: number,
) {
  if (lastSeenLocation) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      lastSeenLocation,
    )}`;
  }

  if (lastSeenLat && lastSeenLong) {
    return `https://www.google.com/maps/search/?api=1&query=${lastSeenLat},${lastSeenLong}`;
  }

  return "";
}
