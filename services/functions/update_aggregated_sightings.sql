CREATE OR REPLACE FUNCTION update_aggregated_sighting()
RETURNS TRIGGER AS $$

-- This function creates a parent sighting with all the latest updates related to all created sightings of a pet

DECLARE 
  pet_owner UUID;
  pet_name TEXT;
  sighting_name TEXT;

BEGIN
  -- Check if linked_sighting_id is provided otherwise create a new entry
  IF NEW.linked_sighting_id IS NOT NULL THEN
    -- Update existing aggregated_sighting to save latest location, time, photo
    -- Only execute update if this is the latest sighting data
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
      -- Only update name if provided by this sighting data
      name = CASE 
        WHEN NEW.name IS NOT NULL AND NEW.name != '' THEN NEW.name 
        ELSE name 
      END,
      updated_at = NOW()
    WHERE linked_sighting_id = NEW.linked_sighting_id AND NEW.last_seen_time > last_seen_time;
    
  ELSE

    -- If pet_id is present, retrieve pet owner ID
    IF NEW.pet_id IS NOT NULL THEN
      SELECT owner_id, name INTO pet_owner, pet_name 
      FROM pets WHERE id = NEW.pet_id;

      sighting_name = COALESCE(pet_name, NEW.name);
    ELSE
      sighting_name = NEW.name;
    END IF;

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
      size,
      species,
      features,
      collar_description,
      name,
      is_active,
      created_at,
      updated_at,
      owner_id
    ) VALUES (
      NEW.id,
      NEW.pet_id,
      NEW.last_seen_lat,
      NEW.last_seen_long,
      NEW.last_seen_location,
      NEW.last_seen_time,
      NEW.photo,
      NEW.gender,
      NEW.colors,
      NEW.breed,
      NEW.size,
      NEW.species,
      NEW.features,
      NEW.collar_description,
      sighting_name,
      true,
      NOW(),
      NOW(),
      pet_owner
    );
    
  END IF;
  
  RETURN NEW;
END;

$$ LANGUAGE plpgsql SECURITY DEFINER;
