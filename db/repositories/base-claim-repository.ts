import { Claim } from "../models/claim";

export interface IClaimRepository {
  getClaims(sightingId: string): Promise<Claim[]>;
  createClaim(data: Partial<Claim>): Promise<string>;
}

export class BaseClaimRepository implements IClaimRepository {
    getClaims(sightingId: string): Promise<Claim[]> {
        throw new Error("Method not implemented.");
    }
    createClaim(data: Partial<Claim>): Promise<string> {
        throw new Error("Method not implemented.");
    }

}
