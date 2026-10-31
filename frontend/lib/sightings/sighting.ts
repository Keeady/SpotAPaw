import { AggregatedSighting } from "./agregated-sighting";

export type Sighting = AggregatedSighting;

type SightingsSuccessResponse<T> = {
  data: T;
  error: undefined;
  errorCode: undefined;
};

type SightingsErrorResponse = {
  error: string;
  data: undefined;
  errorCode: string;
};

export type SightingsResponse<T> =
  | SightingsSuccessResponse<T>
  | SightingsErrorResponse;

  export const GUEST_SIGHTINGS_KEY = "guest_sightings_key";