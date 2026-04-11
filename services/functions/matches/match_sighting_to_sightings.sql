
CREATE OR REPLACE FUNCTION match_pet_sightings()

begin
  return query
  select
    pet_desc_results.id as match_id,
    (pet_desc_results.embeddings <#> pet_embeddings) * -1 as similarity_score
  from pet_desc_results
  where pet_desc_results.embeddings is not null
    and (exclude_id is null or pet_desc_results.id != exclude_id)
    and (pet_desc_results.embeddings <#> pet_embeddings) < match_threshold
  order by pet_desc_results.embeddings <#> pet_embeddings
  limit match_count;
end;
