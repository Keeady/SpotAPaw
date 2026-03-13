export interface Pet {
    id: string,
    createdAt: string,
    ownerId: string,
    name: string;
    species: string;
    breed: string;
    gender: string;
    age: string;
    colors: string;
    features: string;
    isLost: boolean;
    lastSeenTime: string,
    lastSeenLat: number,
    lastSeenLong: number,
    lastSeenLocation: string,
    note: string,
    photo: string
}