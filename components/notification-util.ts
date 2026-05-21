import * as Notifications from "expo-notifications";
import { supabase } from "./supabase-client";
import {
  getExistingUserLocation,
  getSavedLocation,
  SightingLocation,
} from "./get-current-location";
import { SIGHTING_RADIUSKM_NOTIFICATION } from "./constants";

export async function isNotificationPermissionGranted() {
  console.log(
    "Checking notification permission",
    await Notifications.getPermissionsAsync(),
  );
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
    console.log("Notification permission not granted");
    return;
  }

  try {
    let notificationToken: string | null = "";
    notificationToken = await getNotificationToken();
    console.log("Notification token:", notificationToken);
    if (!notificationToken) return;
    const userLocation = await getUserLocationForNotifications();
    console.log("User location for notifications:", userLocation);
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
    console.log("Failed to register for notifications:", error);
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
  console.log(
    "Updating notification subscription enabled:",
    enabled,
    "radius_km:",
    radius_km,
  );
  let notificationToken: string | null = "";
  notificationToken = await getNotificationToken();
  console.log("Notification token:", notificationToken);
  if (!notificationToken) return;
  const userLocation = await getUserLocationForNotifications();
  console.log("User location for notifications:", userLocation);
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
      console.log("Failed to get push token");
      return { data: null };
    });
    return data;
  } catch {
    console.log("Error while getting push token");
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
      console.log("Failed to update notification subscription:", error);
    }
  } catch (error) {
    console.log("Failed to update notification subscription:", error);
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
