BEGIN
  -- Check if linked_sighting_id is provided
  IF NEW.linked_sighting_id IS NOT NULL THEN
    -- Update existing aggregated_sighting
    UPDATE aggregated_sightings
    SET 
      pet_id = NEW.pet_id,
      last_seen_lat = NEW.last_seen_lat,
      last_seen_long = NEW.last_seen_long,
      last_seen_location = NEW.last_seen_location,
      last_seen_time = NEW.last_seen_time,
      photo = NEW.photo,     
      name = NEW.name,
      is_active = NEW.is_active,
      updated_at = NOW()
    WHERE id = NEW.linked_sighting_id;
    
  ELSE
    -- Insert new aggregated_sighting when no linked_sighting_id provided
    INSERT INTO aggregated_sightings (
      pet_id,
      last_seen_lat,
      last_seen_long,
      last_seen_location,
      last_seen_time,
      photo,
      gender,
      colors,
      breed,
      species,
      features,
      name,
      is_active,
      created_at,
      updated_at
    ) VALUES (
      NEW.pet_id,
      NEW.last_seen_lat,
      NEW.last_seen_long,
      NEW.last_seen_location,
      NEW.last_seen_time,
      NEW.photo,
      NEW.gender,
      NEW.colors,
      NEW.breed,
      NEW.species,
      NEW.features,
      NEW.name,
      true,
      NOW(),
      NOW()
    );
    
  END IF;

  RETURN NEW;
END;
