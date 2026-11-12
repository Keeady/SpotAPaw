CREATE OR REPLACE FUNCTION match_pet_sightings(
  pet_embeddings vector,
  match_threshold double precision default -0.8,
  match_count integer default 5,
  candidate_ids integer[] default null
)
returns table (match_id bigint, similarity_score double precision)
language sql stable
as $$
  select
    pet_desc_results.id as match_id,
    (pet_desc_results.embeddings <#> pet_embeddings) * -1 as similarity_score
  from pet_desc_results
  where (candidate_ids is null or pet_desc_results.id = any(candidate_ids))
    and pet_desc_results.embeddings is not null
    and (pet_desc_results.embeddings <#> pet_embeddings) < match_threshold
  order by pet_desc_results.embeddings <#> pet_embeddings
  limit match_count;
$$;