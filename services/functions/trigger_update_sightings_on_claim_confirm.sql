CREATE OR REPLACE FUNCTION trigger_update_sightings_on_claim_confirm()
RETURNS TRIGGER AS $$

DECLARE pet_name TEXT;
BEGIN
  -- Only proceed if confirmed was just set to true
  IF NEW.confirmed = true AND (OLD.confirmed IS NULL OR OLD.confirmed = false) THEN
    -- Fetch pet info
    SELECT name into pet_name FROM pets WHERE id = NEW.pet_id;
    
    -- Update aggregated_sightings where linked_sighting_id matches this claim's sighting_id
    UPDATE aggregated_sightings
    SET 
      pet_id = NEW.pet_id,
      owner_id = NEW.owner_id,
      name = pet_name
    WHERE linked_sighting_id = NEW.sighting_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
