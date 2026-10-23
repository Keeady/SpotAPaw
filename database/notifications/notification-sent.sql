create table if not exists notifications_sent (
  aggregated_sighting_id uuid not null references aggregated_sightings(id) on delete cascade,
  user_id uuid not null,
  type text not null,
  sent_at timestamptz not null default now(),
  primary key (sighting_id, user_id, type)
);

