BEGIN
  -- Only proceed if claim confirmed was just set to true
  IF NEW.confirmed = true AND (OLD.confirmed IS NULL OR OLD.confirmed = false) THEN
    -- Update sightings where id matches this claim's sighting_id
    UPDATE sightings
    SET pet_id = NEW.pet_id
    WHERE id = NEW.sighting_id;

    -- Update sightings where linked_sighting_id matches this claim's sighting_id
    UPDATE sightings
    SET pet_id = NEW.pet_id
    WHERE linked_sighting_id = NEW.sighting_id;
  END IF;

  RETURN NEW;
END;