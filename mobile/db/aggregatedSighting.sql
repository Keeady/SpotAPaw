create table public.aggregated_sightings (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  pet_id uuid null,
  last_seen_lat double precision null,
  last_seen_long double precision null,
  note text null,
  photo text null,
  gender text null,
  colors text null,
  last_seen_location text null,
  last_seen_time timestamp with time zone null,
  breed text null,
  species text null,
  features text null,
  name text null,
  linked_sighting_id uuid null,
  is_active boolean not null default true,
  reporter_name text null,
  reporter_phone text null,
  reporter_id uuid null,
  updated_at timestamp with time zone null default now(),
  owner_id uuid null,
  size text null,
  collar_description text null,
  age smallint null,
  constraint aggregated_sightings_pkey primary key (id)
) TABLESPACE pg_default;

create trigger on_aggregated_sighting_active_status_update
after
update on aggregated_sightings for EACH row
execute FUNCTION update_sightings_active_status ();
