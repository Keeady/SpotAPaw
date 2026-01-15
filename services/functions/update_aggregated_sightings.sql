BEGIN
  -- Check if linked_sighting_id is provided
  IF NEW.linked_sighting_id IS NOT NULL THEN
    -- Update existing aggregated_sighting
    UPDATE aggregated_sightings
    SET 
      last_seen_lat = NEW.last_seen_lat,
      last_seen_long = NEW.last_seen_long,
      last_seen_location = NEW.last_seen_location,
      last_seen_time = NEW.last_seen_time,
      -- Only update photo if NEW.photo is not empty/null
      photo = CASE 
        WHEN NEW.photo IS NOT NULL AND NEW.photo != '' THEN NEW.photo 
        ELSE photo 
      END,
      name = CASE 
        WHEN NEW.name IS NOT NULL AND NEW.name != '' THEN NEW.name 
        ELSE name 
      END,
      is_active = NEW.is_active,
      updated_at = NOW()
    WHERE linked_sighting_id = NEW.linked_sighting_id OR linked_sighting_id = NEW.id;
    
  ELSE
    -- Insert new aggregated_sighting when no linked_sighting_id provided
    INSERT INTO aggregated_sightings (
      linked_sighting_id,
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
      NEW.linked_sighting_id,
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