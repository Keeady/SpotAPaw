DROP TRIGGER IF EXISTS on_create_aggregated_sighting ON sightings;
CREATE TRIGGER on_create_aggregated_sighting
  AFTER INSERT ON aggregated_sighting
  FOR EACH ROW
  EXECUTE FUNCTION enqueue_aggregated_sighting_jobs();