"use client";

import { Profile } from "@/lib/profile/profile";
import UserProfileRenderer from "./user-profile-renderer";
import { updateMyProfile } from "@/lib/profile/update-profile";
import { useState } from "react";

export default function UserProfile({ profile }: { profile: Profile }) {
  const [error, setError] = useState("");

  let data = profile;
  const onSave = async (changes: Profile) => {
    try {
      const response = await updateMyProfile(changes);
      if (response.data) {
        data = response.data;
      } else {
        setError("Failed to update profile. Please try again.");
      }
    } catch (error) {
      setError("Failed to update profile. Please try again.");
    }
  };
  return (
    <div className="flex flex-col">
      <UserProfileRenderer onSave={onSave} profile={data} />

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
