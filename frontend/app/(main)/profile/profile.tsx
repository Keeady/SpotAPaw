import UserProfile from "@/app/components/profile/user-profile";
import { getMyProfile } from "@/lib/profile/get-profile";

export default async function Profile() {
  const { data, error, errorCode } = await getMyProfile();

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
      <UserProfile profile={data} />
    </div>
  );
}
