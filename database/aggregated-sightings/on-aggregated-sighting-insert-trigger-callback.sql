create or replace function enqueue_aggregated_sighting_jobs() 
returns trigger as $$
begin
  insert into aggregated_sighting_jobs (aggregated_sighting_id, job_type)
  values (new.id,'matching'),(new.id,'poster-data'),(new.id,'notify');

  perform pgmq.send('aggregated_sighting_matching', jsonb_build_object('aggregated_sighting_id', new.id));
  perform pgmq.send('aggregated_sighting_poster_data',   jsonb_build_object('aggregated_sighting_id', new.id));
  perform pgmq.send('aggregated_sighting_notify',   jsonb_build_object('aggregated_sighting_id', new.id));
  return new;
end;
$$ language plpgsql security definer;
