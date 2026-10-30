"use client";

import { useCallback, useState } from "react";
import { Settings } from "@/lib/settings/settings";
import SettingsRenderer from "./settings-renderer";
import { updateSettings } from "@/lib/settings/update-settings";
import { SightingLocation } from "../location/location-types";
import {
  logOut,
  resetSavedSearchLocation,
} from "@/app/(main)/aggregated-sightings/action";
import { deleteMyProfile } from "@/lib/profile/delete-profile";
import { useRouter } from "next/navigation";

export default function SettingsList({
  settings,
  savedLocationCookie,
}: {
  settings: Settings;
  savedLocationCookie: SightingLocation;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  let data = settings;

  const onPreferencesChange = useCallback(async (changes: Settings) => {
    try {
      const response = await updateSettings(changes);
      if (response.data) {
        data = response.data;
      } else {
        setError("Failed to update settings. Please try again.");
        setInfo("");
      }
    } catch (error) {
      setError("Failed to update settings. Please try again.");
      setInfo("");
    }
  }, []);

  const onDeleteAccount = useCallback(async () => {
    try {
      await deleteMyProfile();
      await logOut();
    } catch {
      setError(
        "Failed to delete your account. Please try again or contact us.",
      );
      setInfo("");
    } finally {
      setInfo(
        "Your account has been successfully marked for deletion. Deletion happens within 7 days.",
      );
      setError("");
    }
  }, []);

  const noop = () => void 0;
  return (
    <div className="flex flex-col">
      <div className="flex flex-1 flex-col self-start self-stretch py-2 mb-4">
        {info && (
          <p className="text-m font-medium py-2 text-green-700 bg-green-50">
            {info}
          </p>
        )}
        {error && (
          <p className="text-m font-medium py-2 text-red-700 bg-red-50">
            {error}
          </p>
        )}
      </div>
      <SettingsRenderer
        settings={data}
        onPreferencesChange={onPreferencesChange}
        onDeleteAccount={onDeleteAccount}
        onSendMessage={noop}
        links={{
          about: "https://www.restlessmoonstudio.com/products/spotapaw",
          privacy:
            "https://www.restlessmoonstudio.com/products/spotapaw/privacy",
          terms: "https://www.restlessmoonstudio.com/products/spotapaw/terms",
        }}
        fallbackLocation={{
          latitude: data.savedLatitude,
          longitude: data.savedLongitude,
        }}
        savedLocationCookie={savedLocationCookie}
        onResetLocation={resetSavedSearchLocation}
      />
    </div>
  );
}
