export interface Sighting {
  sightingId: string;
  createdAt: string;
  pet: Pet;
  linkedSightingId: string;
  isActive: boolean;
  reporter: SightingContact;
}

export interface AggregatedSighting extends Sighting {
  updatedAt: string;
  linkedSightings: Sighting[];
  similarityScore?: number;
}

export interface Pet {
  petId: string;
  createdAt: string;
  deletedAt: string;
  ownerId: string;
  name: string;
  species: string;
  breed: string;
  gender: string;
  age: number;
  colors: string;
  features: string;
  lastSeenTime: string;
  lastSeenLat: number;
  lastSeenLong: number;
  lastSeenLocation: string;
  note: string;
  photo: string;
  petDescriptionId: string;
  photos: string[];
  size: string;
  collarDescription: string;
  isLost: boolean;
}

interface SightingContact {
  reporterName: string;
  reporterPhone: string;
}
