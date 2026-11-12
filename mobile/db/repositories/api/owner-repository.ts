import { BaseOwnerRepository } from "../base-owner-repository";
import { Owner } from "@/db/models/owner";
import { ApiClient } from "./client";

export class ApiOwnerRepository extends BaseOwnerRepository {
  apiClient: ApiClient;
  constructor(apiClient: ApiClient) {
    super();
    this.apiClient = apiClient;
  }

  async getOwner(userId: string): Promise<Owner | undefined> {
    if (!this.apiClient) {
      throw new Error("Undefined api client");
    }

   return this.apiClient.get<Owner>("/profile");
  }

  async createOwner(payload: Partial<Owner>): Promise<string> {
    if (!this.apiClient) {
      throw new Error("Undefined api client");
    }

    return this.apiClient.post("/profile", {
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      phone: payload.phone,
      countryCode: payload.countryCode,
    });
  }

  async updateOwner(id: string, payload: Partial<Owner>): Promise<void> {
    if (!this.apiClient) {
      throw new Error("Undefined api client");
    }

    return this.apiClient.patch("/profile", {
      firstname: payload.firstName,
      lastname: payload.lastName,
      email: payload.email,
      phone: payload.phone,
      countryCode: payload.countryCode,
    });
  }

  async deleteOwner(id: string): Promise<void> {
    if (!this.apiClient) {
      throw new Error("Undefined api client");
    }

    return this.apiClient.delete("/profile");
  }
}
