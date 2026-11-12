export interface Pet {
  id: string;
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
  isLost: boolean;
  lastSeenTime: string;
  lastSeenLat: number;
  lastSeenLong: number;
  lastSeenLocation: string;
  note: string;
  photo: string;
  petDescriptionId: string;
  photos: string[];
  behavior: string;
  size: string;
  collarDescription: string;
  petPhotos: PetPhoto[];
  petDescription: PetDescription;
}

export interface PetDescription {
  id: string;
  description: string;
  petDescriptionPhotos: PetPhoto[];
}

export interface PetPhoto {
  id: string;
  publicUrl: string;
}
