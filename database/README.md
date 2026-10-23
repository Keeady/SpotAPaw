# Flow

On insert in sightings table, a trigger runs which insert into aggregated_sightings table
On insert in aggregated_sighting, a trigger runs:
1- it insert 3 new jobs into the aggregated_sighting jobs table
2- sends each one message to the 3 queues: sighting_matching, sighting_poster, sighting_notify

## Create 3 Nestjs workers: each

- reads a message from the queue
- update jobs table, set job running, increment attempts
- execute job
- on success, archive and set succeeded
- on failure, set last_error, call pgmq.set_vt to apply exponential backoff
- If read_ct exceeds your max (say 5), set dead, archive the message, and alert

## Idempotency

Job retries: aggregated_sighting_id + job_type

Matching job: aggregated_sighting_id + pet_desc_id

poster job: aggregated_sighting_id, store poster files using {aggregated_sighting_id}.{extension}

notification job: aggregated_sighting_id, subscriber_id, type (new sighting, match found)

## Future jobs

If a match is found, enqueue a new event type which triggers notification job

If poster is ready, notify client

If a sighting is resolved, enqueue a new event to notify users who created (subscribe) to the sightings

## Tracking

Use a cron to periodically check for jobs stuck in running or pending and re-enqueue them

Check for dead jobs and alert

Handle SIGTERM

https://vercel.com/docs/daemons
