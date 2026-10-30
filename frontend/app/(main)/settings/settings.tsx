import PetListRenderer from "@/app/components/pets/pet-list-renderer";
import UserProfile from "@/app/components/profile/user-profile";
import SettingsRenderer from "@/app/components/settings/settings-renderer";
import { getMyPets } from "@/lib/pets/pet-my-pets";
import { getMyProfile } from "@/lib/profile/get-profile";
import { getMySettings } from "@/lib/settings/get-settings";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function Settings() {
  const { data, error, errorCode } = await getMySettings();

  if (!data || error) {
    const message =
      errorCode === "NOT_AUTHENTICATED"
        ? "Please login to view your profile"
        : "Something went wrong.";
    return (
      <div className="flex flex-col px-3 w-full">
        <p className="my-10 self-center text-sm text-neutral-600 dark:text-neutral-400">
          {message}
        </p>
      </div>
    );
  }

  return (
    <div className="flex w-full grow flex-col px-3 items-start justify-start text-start">
      <SettingsRenderer settings={data} />
    </div>
  );
}
