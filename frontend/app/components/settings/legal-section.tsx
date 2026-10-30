"use client";

import { FileText, Info, ShieldCheck } from "lucide-react";
import { SettingsItem, SettingsSection } from "./utils";

export type LegalLinks = {
  about: string;
  privacy: string;
  terms: string;
};

export default function LegalSection({ links }: { links: LegalLinks }) {
  return (
    <SettingsSection title="Legal">
      <SettingsItem
        icon={Info}
        tone="sky"
        title="About"
        description="Learn more about the app"
        href={links.about}
      />
      <SettingsItem
        icon={ShieldCheck}
        tone="teal"
        title="Privacy and Policy"
        description="Learn how we handle your data"
        href={links.privacy}
      />
      <SettingsItem
        icon={FileText}
        tone="orange"
        title="Terms of Service"
        description="Read our terms and conditions"
        href={links.terms}
      />
    </SettingsSection>
  );
}
