export type Poster = {
  id: string;
  createdAt: string;
  updatedAt: string;
  sightingId: string;
  headline: string;
  subheadline: string;
  photoUrl: string | null;
  description: string;

  cta: string;

  lastSeenLocation: string;

  lastSeenTime: string;

  contactName: string;

  contactPhone: string;

  name: string;

  breed: string;

  colors: string;

  pdfUrl: string | null;

  pngUrl: string | null;
};

export type PosterUpdate = Partial<Poster>;

export type PosterEditableFields = Pick<
  Poster,
  "description" | "cta" | "contactName" | "contactPhone"
>;

type PostersSuccessResponse<T> = {
  data: T;
  error: undefined;
};

type PostersErrorResponse = {
  error: string;
  data: undefined;
};

export type PostersResponse<T> =
  | PostersSuccessResponse<T>
  | PostersErrorResponse;
