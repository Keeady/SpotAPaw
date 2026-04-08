export interface Sighting {
    id: string;
    createdAt: string;
    petId: string;
    lastSeenLat: number;
    lastSeenLong: number;
    lastSeenLocation: string;
    lastSeenTime: string;
    note: string;
    photo: string;
    gender: string;
    colors: string;
    breed: string;
    species: string;
    features: string;
    name: string;
    linkedSightingId: string;
    isActive: boolean;
    reporterName: string;
    reporterPhone: string;
    reporterId: string;
    size: string;
    collarDescription: string;
    age: number;
    petDescriptionId: string;
}

export interface AggregatedSighting extends Sighting {
    updatedAt: string;
    ownerId: string;
    linkedSightings: Sighting[];
}