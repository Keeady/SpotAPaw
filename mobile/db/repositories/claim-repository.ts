import { Claim } from "../models/claim";
import { IClaimRepository } from "./base-claim-repository";
import { ApiClaimRepository } from "./api/claim-repository";
import { authenticatedApiClient } from "./api/client";

export class ClaimRepository implements IClaimRepository {
    
    getClaims(sightingId: string): Promise<Claim[]> {
        const repository = new ApiClaimRepository(authenticatedApiClient);
        return repository.getClaims(sightingId);
    }
    createClaim(data: Partial<Claim>): Promise<string> {
        const repository = new ApiClaimRepository(authenticatedApiClient);
        return repository.createClaim(data);
    }

}
