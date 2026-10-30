"use client";

import { Mail, Trash2 } from "lucide-react";
import { useState } from "react";
import ContactDialog from "./contact-dialog";
import DeleteAccountDialog from "./delete-account-dialog";
import { SettingsItem, SettingsSection } from "./utils";

type AccountSectionProps = {
  onDeleteAccount: () => Promise<void> | void;
  onSendMessage: (message: string) => Promise<void> | void;
};

export default function AccountSection({
  onDeleteAccount,
  onSendMessage,
}: AccountSectionProps) {
  const [openDialog, setOpenDialog] = useState<"delete" | "contact" | null>(
    null,
  );
  const close = () => setOpenDialog(null);

  return (
    <SettingsSection title="Account Management">
      <SettingsItem
        icon={Trash2}
        tone="red"
        title="Delete Account"
        description="Permanently delete your account and data"
        destructive
        onClick={() => setOpenDialog("delete")}
      />
      <SettingsItem
        icon={Mail}
        tone="sky"
        title="Contact Us"
        description="Get in touch or send us your feedback!"
        onClick={() => setOpenDialog("contact")}
      />

      <DeleteAccountDialog
        open={openDialog === "delete"}
        onClose={close}
        onConfirm={onDeleteAccount}
      />
      <ContactDialog
        open={openDialog === "contact"}
        onClose={close}
        onSend={onSendMessage}
      />
    </SettingsSection>
  );
}
