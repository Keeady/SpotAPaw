import { formatDistanceToNow, Locale } from "date-fns";
import { SightingLocation } from "../get-current-location";
import { getDistance, convertDistance } from "geolib";
import { enUS, es } from "date-fns/locale";
import { TFunction } from "i18next";

const supportedLocales: { [key: string]: Locale } = {
  en: enUS,
  es: es,
};

export function getLastSeenLocationDistance(
  location: SightingLocation,
  lastSeenLat: number,
  lastSeenLong: number,
  translate?: TFunction<readonly ["petprofile", "translation"], undefined>,
) {
  const dist = getDistance(location, {
    latitude: lastSeenLat,
    longitude: lastSeenLong,
  });
  const miles = convertDistance(dist, "mi");
  if (miles > 0.1) {
    return translate
      ? translate("milesAway", {
          distance: miles.toFixed(1),
          ns: "translation",
        })
      : `${miles.toFixed(1)} miles away`;
  }

  const feet = convertDistance(dist, "ft");
  return translate
    ? translate("feetAway", { distance: feet.toFixed(), ns: "translation" })
    : `${feet.toFixed()} feet away`;
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
