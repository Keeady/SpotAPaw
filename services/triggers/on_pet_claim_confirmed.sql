DROP TRIGGER IF EXISTS on_pet_claim_confirmed ON pet_claims;
CREATE TRIGGER on_pet_claim_confirmed
  AFTER UPDATE ON pet_claims
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_sightings_on_claim_confirm();