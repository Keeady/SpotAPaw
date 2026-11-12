DROP TRIGGER IF EXISTS on_create_pet ON pets;
CREATE TRIGGER on_create_pet
  AFTER INSERT ON pets
  FOR EACH ROW
  EXECUTE FUNCTION enqueue_pet_jobs();