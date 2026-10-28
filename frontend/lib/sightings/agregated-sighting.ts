export type AggregatedSighting = {
  id: string;
  createdAt: string;
  updatedAt: string;
  petId: string | null;
  lastSeenLat: number;
  lastSeenLong: number;
  lastSeenLocation: string;
  lastSeenTime: string;
  note: string | null;
  gender: string | null;
  colors: string;
  breed: string;
  species: string;
  features: string;
  name: string;
  linkedSightingId: string;
  isActive: boolean;
  reporterName: string | null;
  reporterPhone: string | null;
  reporterId: string | null;
  size: string;
  collarDescription: string | null;
  age: number | null;
  photos: string[];
  behavior: string | null;
  posterId: string | null;
};

export type Sighting = AggregatedSighting;

type AggregatedSightingsSuccessResponse<T> = {
  data: T;
  error: undefined
};

type AggregatedSightingsErrorResponse = {
  error: string;
  data: undefined
};

export type AggregatedSightingsResponse<T> =
  | AggregatedSightingsSuccessResponse<T>
  | AggregatedSightingsErrorResponse;

export type AggregatedSightingDetail = {
  summary: AggregatedSighting;
  sightings: Sighting[];
  claimed: boolean;
  hasOwner: boolean;
  petName: string
};