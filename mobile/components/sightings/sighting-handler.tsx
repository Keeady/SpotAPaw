import { Href, Router } from "expo-router";
import { Platform, Share } from "react-native";
import * as Clipboard from "expo-clipboard";
import { showMessage } from "react-native-flash-message";
import { log } from "../logs";
import { createErrorLogMessage } from "../util";
import { TFunction } from "i18next";

export function handleAddingSighting(
  router: Router,
  sightingsRoute: "my-sightings" | "sightings",
  sightingId?: string,
  petId?: string,
) {
  if (Platform.OS === "web") {
    const APP_STORE_URL = "https://apps.apple.com/app/id6757455715";
    const PLAY_STORE_URL =
      "https://play.google.com/store/apps/details?id=com.bcamaria.SpotAPaw";

    // On web: try deep link, fall back to store based on user agent
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const storeUrl = isIOS ? APP_STORE_URL : PLAY_STORE_URL;

    if (sightingId) {
      const url = petId
        ? `spotapaw://${sightingsRoute}/new/?id=${sightingId}&petId=${petId}`
        : `spotapaw://${sightingsRoute}/new?id=${sightingId}`;

      window.location.href = url;
    } else {
      window.location.href = `spotapaw://${sightingsRoute}/new`;
    }

    setTimeout(() => {
      window.location.href = storeUrl;
    }, 1500);
  } else if (sightingId) {
    const url = petId
      ? `/${sightingsRoute}/new/?id=${sightingId}&petId=${petId}`
      : `/${sightingsRoute}/new/?id=${sightingId}`;
    router.push(url as Href);
  } else {
    router.push(`/${sightingsRoute}/new`);
  }
}

export async function handleSharingSighting(
  sightingId: string,
  petName: string,
  t: TFunction,
) {
  const thisPet = t("thisPet", "this pet", { ns: "sightingpage" });
  const sightingUrl = `https://spotapaw.com/og/sightings/${sightingId}`;
  const shareMessage = t(
    "shareSightingMessage",
    `🐾 Have you seen ${petName}? Help them get home!`,
    { ns: "sightingpage", petName: petName || thisPet },
  );

  const lostPet = t("lostPet", "Lost Pet", { ns: "sightingpage" });
  if (Platform.OS === "web") {
    if (navigator.share) {
      try {
        await navigator.share({
          title: t("sightingSpottedTitle", `${petName || lostPet} spotted!`, {
            ns: "sightingpage",
            petName: petName || lostPet,
          }),
          text: shareMessage,
          url: sightingUrl,
        });
      } catch {
        // User cancelled
      }
    } else {
      await Clipboard.setStringAsync(sightingUrl)
        .then(() => {
          showMessage({
            message: t("linkCopiedToClipboard", "Link copied to clipboard!", {
              ns: "sightingpage",
            }),
            type: "success",
            icon: "success",
            statusBarHeight: 50,
          });
        })
        .catch((error) => {
          const errorMessage = createErrorLogMessage(error);
          log(`Failed to copy link to clipboard on web: ${errorMessage}`);
          showMessage({
            message: t(
              "failedToCopyLinkToClipboard",
              "Failed to copy link to clipboard.",
              { ns: "sightingpage" },
            ),
            type: "warning",
            icon: "warning",
            statusBarHeight: 50,
          });
        });
    }
    return;
  }

  try {
    const shareObj = {
      message:
        Platform.OS === "ios"
          ? shareMessage
          : `${shareMessage}\n${sightingUrl}\n`,
      url: sightingUrl,
      title: t("sightingSpottedTitle", `${petName || lostPet} spotted!`, {
        ns: "sightingpage",
        petName: petName || lostPet,
      }),
    };

    await Share.share(shareObj);
  } catch (error) {
    const errorMessage = createErrorLogMessage(error);
    log(`Failed to share sighting: ${errorMessage}`);
  }
}
