create table aggregated_sighting_jobs (
  id uuid primary key default gen_random_uuid(),
  aggregated_sighting_id uuid not null references aggregated_sightings(id) on delete cascade,
  job_type text not null check (job_type in ('matching','poster-data','notify', 'poster-gen')),
  status text not null default 'pending' check (status in ('pending','running','succeeded','failed','dead')),
  attempts int not null default 0,
  last_error text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (aggregated_sighting_id, job_type)          -- idempotency anchor
);
