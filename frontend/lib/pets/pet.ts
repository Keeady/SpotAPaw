export type Pet = {
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
};

type PetsSuccessResponse<T> = {
  data: T;
  error: undefined;
  errorCode: undefined;
};

type PetsErrorResponse = {
  error: string;
  data: undefined;
  errorCode: string;
};

export type PetsResponse<T> =
  | PetsSuccessResponse<T>
  | PetsErrorResponse;
