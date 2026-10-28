import { AggregatedSighting } from "../sightings/agregated-sighting";

export type Match = {
  id: string;
  score: number;
  createdAt: string;
  updatedAt: string;
  sighting: AggregatedSighting | null;
};

type MatchessSuccessResponse<T> = {
  data: T;
  error: undefined
};

type MatchesErrorResponse = {
  error: string;
  data: undefined
};

export type MatchesResponse<T> =
  | MatchessSuccessResponse<T>
  | MatchesErrorResponse;
