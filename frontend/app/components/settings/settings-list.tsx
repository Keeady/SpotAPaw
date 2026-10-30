"use client";

import { useState } from "react";
import { Settings } from "@/lib/settings/settings";
import SettingsRenderer from "./settings-renderer";
import { updateSettings } from "@/lib/settings/update-settings";
import { SightingLocation } from "../location/location-types";
import { resetSavedSearchLocation } from "@/app/(main)/aggregated-sightings/action";

export default function SettingsList({
  settings,
  savedLocationCookie,
}: {
  settings: Settings;
  savedLocationCookie: SightingLocation;
}) {
  const [error, setError] = useState("");

  let data = settings;

  const onPreferencesChange = async (changes: Settings) => {
    try {
      const response = await updateSettings(changes);
      if (response.data) {
        data = response.data;
      } else {
        setError("Failed to update settings. Please try again.");
      }
    } catch (error) {
      setError("Failed to update settings. Please try again.");
    }
  };

  const noop = () => void 0;
  return (
    <div className="flex flex-col">
      <SettingsRenderer
        settings={data}
        onPreferencesChange={onPreferencesChange}
        onDeleteAccount={noop}
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

      <div className="flex flex-1 flex-col self-start self-stretch py-2 mb-4">
        {error && (
          <p className="text-m font-medium py-2 text-red-700 bg-red-50">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
