import { formatDistanceToNow, Locale } from "date-fns";
import { getDistance, convertDistance } from "geolib";
import { enUS, es, fr, ar } from "date-fns/locale";

const supportedLocales: { [key: string]: Locale } = {
  en: enUS,
};

export function getLastSeenLocationDistance(
  fromLat: number,
  fromLong: number,
  lastSeenLat: number,
  lastSeenLong: number,
) {
  const dist = getDistance({lat: fromLat, lng: fromLong}, {
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

export function getLastSeenTimeDistance(
  lastSeenTime: string,
  preferredLanguage?: string,
) {
  if (!lastSeenTime) {
    return "";
  }

  let locale = enUS;

  if (preferredLanguage && supportedLocales[preferredLanguage]) {
    locale = supportedLocales[preferredLanguage];
  }

  return formatDistanceToNow(new Date(lastSeenTime), {
    addSuffix: true,
    locale: locale,
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
