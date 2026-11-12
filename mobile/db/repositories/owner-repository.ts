import { IOwnerRepository } from "./base-owner-repository";
import { Owner } from "../models/owner";
import { ApiOwnerRepository } from "./api/owner-repository";
import { authenticatedApiClient } from "./api/client";

export class OwnerRepository implements IOwnerRepository {
  getOwner(id: string): Promise<Owner | undefined> {
    const repository = new ApiOwnerRepository(authenticatedApiClient);
    return repository.getOwner(id);
  }
  createOwner(data: Partial<Owner>): Promise<string> {
    const repository = new ApiOwnerRepository(authenticatedApiClient);
    return repository.createOwner(data);
  }
  updateOwner(id: string, data: Partial<Owner>): Promise<void> {
    const repository = new ApiOwnerRepository(authenticatedApiClient);
    return repository.updateOwner(id, data);
  }
  deleteOwner(id: string): Promise<void> {
    const repository = new ApiOwnerRepository(authenticatedApiClient);
    return repository.deleteOwner(id);
  }
}
