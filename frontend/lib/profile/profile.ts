export type Profile = {
    ownerId: string;
    firstname?: string;
    lastname?: string;
    email?: string;
    phone?: string;
    countryCode?: string;
    deleteAccount?: boolean;
}

type ProfileSuccessResponse<T> = {
  data: T;
  error: undefined;
  errorCode: undefined;
};

type ProfileErrorResponse = {
  error: string;
  data: undefined;
  errorCode: string;
};

export type ProfileResponse<T> =
  | ProfileSuccessResponse<T>
  | ProfileErrorResponse;

