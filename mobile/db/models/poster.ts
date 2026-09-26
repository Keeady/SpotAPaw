export interface Poster {
    id: string;
    sighting_id: string;
    poster_url: string;
    headline: string;
    subheadline: string;
    photo_url: string | null;
    description: string;
    cta: string;
    last_seen_location: string;
    last_seen_time: string;
    contact_name: string;
    contact_phone: string;
    created_at: string;
    name: string;
    breed: string;
    colors: string;
    pdf_url: string;
    png_url: string;
    html_url: string;
}
