"use client";

import AccountSection from "@/app/components/settings/account-section";
import LegalSection, {
  LegalLinks,
} from "@/app/components/settings/legal-section";
import LocationSection, {
  Coordinates,
} from "@/app/components/settings/location-section";
import PreferencesSection from "@/app/components/settings/preference-section";
import { Settings } from "@/lib/settings/settings";
import { useState } from "react";

type SettingsPageProps = {
  settings: Settings;
  links: LegalLinks;
  onDeleteAccount: () => Promise<void> | void;
  onSendMessage: (message: string) => Promise<void> | void;
  /** Manually selected coordinates, used to show a city when device location is off. */
  fallbackLocation?: Coordinates;
  /** Cookie that holds the manually selected location (default: "saved_location"). */
  savedLocationCookie?: string;
  onResetLocation?: () => void;
  initialPreferences?: Partial<Settings>;
  /** Persist preferences (API call, cookie, localStorage...). */
  onPreferencesChange?: (preferences: Settings) => void;
};

const DEFAULT_PREFERENCES = {
  isLocationEnabled: false,
  savedLongitude: 0,
  savedLatitude: 0,
  isAIenabled: false,
  language: "EN",
  radius: 25,
  isNotificationEnabled: false,
};

export default function SettingsRenderer({
  links,
  onDeleteAccount,
  onSendMessage,
  fallbackLocation,
  savedLocationCookie,
  onResetLocation,
  initialPreferences,
  onPreferencesChange,
}: SettingsPageProps) {
  const [preferences, setPreferences] = useState<Settings>({
    ...DEFAULT_PREFERENCES,
    ...initialPreferences,
  });

  const updatePreferences = (patch: Partial<Settings>) => {
    const next = { ...preferences, ...patch };
    setPreferences(next);
    onPreferencesChange?.(next);
  };

  return (
    <div className="flex w-full grow flex-col bg-white px-3">
      <div className="mx-auto flex w-full max-w-[900px] flex-col gap-6 py-4">
        <h1 className="px-2 text-2xl font-semibold text-neutral-900">
          Settings
        </h1>

        <LocationSection
          fallbackLocation={fallbackLocation}
          savedLocationCookie={savedLocationCookie}
          onReset={onResetLocation}
        />
        <PreferencesSection value={preferences} onChange={updatePreferences} />
        <LegalSection links={links} />
        <AccountSection
          onDeleteAccount={onDeleteAccount}
          onSendMessage={onSendMessage}
        />
      </div>
    </div>
  );
}
