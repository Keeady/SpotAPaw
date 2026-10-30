export type Settings = {
    isLocationEnabled: boolean;
    savedLongitude: number;
    savedLatitude: number;
    isAIenabled: boolean;
    language: string;
    radius: number;
    isNotificationEnabled: boolean;
}

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
