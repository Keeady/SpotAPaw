-- Create trigger on sightings table
DROP TRIGGER IF EXISTS on_create_sighting ON sightings;
CREATE TRIGGER on_create_sighting
  AFTER INSERT ON sightings
  FOR EACH ROW
  EXECUTE FUNCTION update_aggregated_sighting();