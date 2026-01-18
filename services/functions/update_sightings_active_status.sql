CREATE OR REPLACE FUNCTION update_sightings_active_status()
RETURNS TRIGGER AS $$
BEGIN
  -- update sightings status if parent sighting status changed to inactive for a known pet
  IF NEW.is_active IS FALSE AND NEW.pet_id IS NOT NULL THEN
    UPDATE sightings
    SET is_active = FALSE
    WHERE pet_id = NEW.pet_id;
  END IF;

  RETURN NEW;
END
$$ LANGUAGE plpgsql SECURITY DEFINER;
