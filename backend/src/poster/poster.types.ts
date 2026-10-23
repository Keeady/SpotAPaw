export type PosterType = 'lost' | 'found';

export interface PosterCopy {
  headline: string;
  subheadline: string;
  description: string;
  cta: string;
  lastSeenLocation: string;
  lastSeenDate: string;
}

/** Normalized data sent to the AI / used for templated copy. */
export interface PosterPayload {
  name: string;
  breed: string;
  species: string;
  lastSeenLocation: string;
  lastSeenDate: string;
  note: string;
  behavior: string;
  age: number;
  size: string;
  colors: string;
  collarDescription: string[] | string;
  features: string[] | string;
  gender: string;
}

export interface GeneratePosterOptions {
  /** Override the POSTER_AI_ENABLED config flag. */
  useAi?: boolean;
}

export class PosterSightingNotFoundError extends Error {
  constructor(sightingId: string) {
    super(`sighting ${sightingId} not found`);
    this.name = 'PosterSightingNotFoundError';
  }
}