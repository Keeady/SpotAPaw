-- Create trigger on sightings table
DROP TRIGGER IF EXISTS on_aggregated_sighting_active_status_update ON aggregated_sighting;
CREATE TRIGGER on_aggregated_sighting_active_status_update
  AFTER UPDATE ON aggregated_sighting
  FOR EACH ROW
  EXECUTE FUNCTION update_sightings_active_status();
