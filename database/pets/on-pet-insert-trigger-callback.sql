create or replace function enqueue_pet_jobs() 
returns trigger as $$
begin
  insert into pet_jobs (pet_id, job_type)
  values (new.id,'new-photos');

  perform pgmq.send('new_pet_photos', jsonb_build_object('pet_id', new.id));
  return new;
end;
$$ language plpgsql security definer;
