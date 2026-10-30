export type Settings = {
    isLocationEnabled: boolean;
    savedLongitude: number;
    savedLatitude: number;
    isAIenabled: boolean;
    language: string;
    radius: number;
    isNotificationEnabled: boolean;
}

export const DEFAULT_PREFERENCES = {
  isLocationEnabled: false,
  savedLongitude: 0,
  savedLatitude: 0,
  isAIenabled: false,
  language: "EN",
  radius: 25,
  isNotificationEnabled: false,
};

type SettingsSuccessResponse<T> = {
  data: T;
  error: undefined;
  errorCode: undefined;
};

type SettingsErrorResponse = {
  error: string;
  data: undefined;
  errorCode: string;
};

export type SettingsResponse<T> =
  | SettingsSuccessResponse<T>
  | SettingsErrorResponse;
