create or replace function get_nearby_sighting_subscribers(last_seen_long float, last_seen_lat float)
returns table(notification_push_token text) as $$
  select notification_push_token
  from sighting_subscriptions
  where ST_DWithin(
    center,
    ST_MakePoint(last_seen_long, last_seen_lat)::geography,
    radius_km * 1000  -- ST_DWithin uses meters
  );
$$ language sql stable;
