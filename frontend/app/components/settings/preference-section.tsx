"use client";

import { Bell, Languages, Radar, Sparkles } from "lucide-react";
import { useState } from "react";
import { ChoiceDialog, type ChoiceOption } from "./dialog";
import { SettingsItem, SettingsSection, Toggle } from "./utils";
import { Settings } from "@/lib/settings/settings";

export const DEFAULT_LANGUAGES: ChoiceOption<string>[] = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
  { value: "pt", label: "Português" },
  { value: "it", label: "Italiano" },
  { value: "ja", label: "日本語" },
  { value: "ko", label: "한국어" },
  { value: "zh", label: "中文" },
];

const RADIUS_OPTIONS: ChoiceOption<number>[] = [1, 5, 10, 25, 50, 100].map(
  (km) => ({ value: km, label: `${km} km` }),
);

type PreferencesSectionProps = {
  value: Settings;
  onChange: (patch: Partial<Settings>) => void;
  languages?: ChoiceOption<string>[];
};

export default function PreferencesSection({
  value,
  onChange,
  languages = DEFAULT_LANGUAGES,
}: PreferencesSectionProps) {
  const [openDialog, setOpenDialog] = useState<"language" | "radius" | null>(
    null,
  );
  const close = () => setOpenDialog(null);

  const languageLabel =
    languages.find((l) => l.value === value.language)?.label ?? value.language;

  return (
    <SettingsSection title="Preferences">
      <SettingsItem
        icon={Sparkles}
        tone="violet"
        title="AI Image Analysis"
        description="Enable image analysis for pet identification and matching. Your photos are not used for model training."
        trailing={
          <Toggle
            label="AI image analysis"
            checked={value.isAIenabled}
            onChange={(aiImageAnalysis) => onChange({ isAIenabled: aiImageAnalysis })}
          />
        }
      />

      <SettingsItem
        icon={Languages}
        tone="pink"
        title="Language"
        value={languageLabel}
        onClick={() => setOpenDialog("language")}
      />

      <SettingsItem
        icon={Radar}
        tone="cyan"
        title="Sighting Radius"
        value={`${value.radius} km`}
        onClick={() => setOpenDialog("radius")}
      />

      <SettingsItem
        icon={Bell}
        tone="indigo"
        title="Push Notifications"
        description="Get notified about updates and events"
        trailing={
          <Toggle
            label="Push notifications"
            checked={value.isNotificationEnabled}
            onChange={(pushNotifications) => onChange({ isNotificationEnabled: pushNotifications })}
          />
        }
      />

      <ChoiceDialog
        open={openDialog === "language"}
        onClose={close}
        title="Language"
        subtitle="Choose your preferred language."
        options={languages}
        value={value.language}
        onSelect={(language) => onChange({ language })}
      />

      <ChoiceDialog
        open={openDialog === "radius"}
        onClose={close}
        title="Sighting Radius"
        subtitle="Show sightings within this distance of your location."
        options={RADIUS_OPTIONS}
        value={value.radius}
        onSelect={(radiusKm) => onChange({ radius: radiusKm })}
      />
    </SettingsSection>
  );
}
