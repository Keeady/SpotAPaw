create table pet_jobs (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references pets(id) on delete cascade,
  job_type text not null check (job_type in ('new-photos')),
  status text not null default 'pending' check (status in ('pending','running','succeeded','failed','dead')),
  attempts int not null default 0,
  last_error text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (pet_id, job_type)          -- idempotency anchor
);
