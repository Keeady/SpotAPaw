"use client";

import { Profile } from "@/lib/profile/profile";
import UserProfileRenderer from "./user-profile-renderer";

export default function UserProfile({ profile }: { profile: Profile }) {
  const noop = () => void 0;

  return <UserProfileRenderer onSave={noop} profile={profile} />;
}
