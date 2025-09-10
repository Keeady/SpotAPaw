export type PetSighting = {
    id: string;
    name: string;
    created_at: string;
    colors: string;
    features: string;
    species: string;
    breed: string;
    gender: string;
    photo: string;
    last_seen_long: number;
    last_seen_lat: number;
    last_seen_location: string;
    last_seen_time: string;
    pet_id: string;
    reporter_id: string;
    note:string;
    linked_sighting_id?: string;
    sighting_contact: SightingContact;
}

export type SightingReporter = {
    name: string;
    phone: string;
}

export type SightingContact = {
    id: string;
    created_at: string;
    name: string;
    phone: string;
    sighting_id: string;
}

