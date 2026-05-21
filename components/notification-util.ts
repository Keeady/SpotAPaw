import * as Notifications from "expo-notifications";
import { supabase } from "./supabase-client";
import {
  getExistingUserLocation,
  getSavedLocation,
  SightingLocation,
} from "./get-current-location";
import { SIGHTING_RADIUSKM_NOTIFICATION } from "./constants";
import { log } from "./logs";
import { createErrorLogMessage } from "./util";

export async function isNotificationPermissionGranted() {
  return Notifications.getPermissionsAsync()
    .then(
      ({ status, ios }) =>
        status === "granted" ||
        ios?.status !== Notifications.IosAuthorizationStatus.DENIED,
    )
    .catch(() => false);
}

export async function registerForNotifications() {
  const isGranted = await isNotificationPermissionGranted();
  if (!isGranted) {
    log("Failed to register. Notification permission not granted");
    return;
  }

  try {
    let notificationToken: string | null = "";
    notificationToken = await getNotificationToken();
    if (!notificationToken) return;
    const userLocation = await getUserLocationForNotifications();
    if (!userLocation) return;

    const { data, error } = await supabase.functions.invoke(
      "register_push_notification",
      {
        method: "POST",
        body: JSON.stringify({
          notificationToken: notificationToken,
          locationLat: userLocation.lat,
          locationLong: userLocation.lng,
          radius_km: SIGHTING_RADIUSKM_NOTIFICATION,
        }),
      },
    );
    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    const errorMessage = createErrorLogMessage(error);
    log("Failed to register for notifications: " + errorMessage);
  }
}

export async function unregisterFromNotifications() {
  updateNotificationSubscriptionEnabled(false);
}

export async function updateNotificationSubscriptionLocation(
  location: SightingLocation,
) {
  let notificationToken: string | null = "";
  notificationToken = await getNotificationToken();
  if (!notificationToken) return;

  await updateNotificationSubscription(notificationToken, location, true);
}

export async function updateNotificationSubscriptionEnabled(
  enabled: boolean,
  radius_km?: number,
) {
  let notificationToken: string | null = "";
  notificationToken = await getNotificationToken();
  if (!notificationToken) return;
  const userLocation = await getUserLocationForNotifications();
  if (!userLocation) return;
  await updateNotificationSubscription(
    notificationToken,
    userLocation,
    enabled,
    radius_km,
  );
}

async function getNotificationToken() {
  try {
    const { data } = await Notifications.getExpoPushTokenAsync().catch(() => {
      return { data: null };
    });
    return data;
  } catch (error) {
    const errorMessage = createErrorLogMessage(error);
    log("Error while getting push token: " + errorMessage);
  }
  return null;
}

async function updateNotificationSubscription(
  notificationToken: string,
  userLocation: SightingLocation,
  enabled: boolean = true,
  radius_km: number = SIGHTING_RADIUSKM_NOTIFICATION,
) {
  try {
    const { error } = await supabase.from("sighting_subscriptions").upsert(
      {
        notification_push_token: notificationToken,
        center: `POINT(${userLocation.lng} ${userLocation.lat})`, // PostGIS: lon first
        radius_km: radius_km,
        enabled,
      },
      { onConflict: "notification_push_token" },
    );
    if (error) {
      const errorMessage = createErrorLogMessage(error);
      log("Failed to update notification subscription: " + errorMessage);
    }
  } catch (error) {
    const errorMessage = createErrorLogMessage(error);
    log("Failed to update notification subscription: " + errorMessage);
  }
}

async function getUserLocationForNotifications(): Promise<
  SightingLocation | undefined
> {
  let userLocation: SightingLocation | undefined = undefined;
  try {
    userLocation = await getExistingUserLocation();

    if (!userLocation) {
      userLocation = await getSavedLocation();
    }
  } catch {
    userLocation = await getSavedLocation();
  }

  return userLocation;
}
