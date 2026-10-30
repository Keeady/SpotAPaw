import SettingsList from "@/app/components/settings/settings-list";
import { getMySettings } from "@/lib/settings/get-settings";
import { DEFAULT_PREFERENCES } from "@/lib/settings/settings";

export default async function SettingsPage() {
  const { data, error, errorCode } = await getMySettings();
  console.log(data, error, errorCode)

  if (!data && error && errorCode !== "NOT_AUTHENTICATED") {
    const message = "Something went wrong.";
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
      <SettingsList settings={data || DEFAULT_PREFERENCES} />
    </div>
  );
}
