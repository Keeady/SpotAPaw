import { supabase } from "@/components/supabase-client";
import { Claim } from "../models/claim";
import { IClaimRepository } from "./base-claim-repository";
import { SupabaseClaimRepository } from "./supabase/claim-repository";

export class ClaimRepository implements IClaimRepository {
    getClaims(sightingId: string): Promise<Claim[]> {
        const repository = new SupabaseClaimRepository(supabase);
        return repository.getClaims(sightingId);
    }
    createClaim(data: Partial<Claim>): Promise<string> {
        const repository = new SupabaseClaimRepository(supabase);
        return repository.createClaim(data);
    }

}
