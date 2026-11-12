import { Claim } from "@/db/models/claim";
import { BaseClaimRepository } from "../base-claim-repository";
import { ApiClient } from "./client";

export class ApiClaimRepository extends BaseClaimRepository {
  apiClient: ApiClient;
  constructor(apiClient: ApiClient) {
    super();
    this.apiClient = apiClient;
  }

  async getClaims(sightingId: string): Promise<Claim[]> {
    if (!this.apiClient) {
      throw new Error("Undefined api client");
    }

    return this.apiClient.get<Claim[]>(`/claims?sightingId=${sightingId}`);
  }
  async createClaim(payload: Partial<Claim>): Promise<string> {
    if (!this.apiClient) {
      throw new Error("Undefined api client");
    }

    console.log(payload)

    return this.apiClient.post("/claims", {
      petId: payload.petId,
      sightingId: payload.sightingId,
    });
  }
}
