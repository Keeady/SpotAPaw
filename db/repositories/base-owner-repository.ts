import { Owner } from "../models/owner";

export interface IOwnerRepository {
  getOwner(id: string): Promise<Owner | undefined>;
  createOwner(data: Partial<Owner>): Promise<string>;
  updateOwner(id: string, data: Partial<Owner>): Promise<void>;
  deleteOwner(id: string): Promise<void>;
}

export class BaseOwnerRepository implements IOwnerRepository {
  getOwner(_id: string): Promise<Owner | undefined> {
    throw new Error("Method not implemented.");
  }
  createOwner(_data: Partial<Owner>): Promise<string> {
    throw new Error("Method not implemented.");
  }
  updateOwner(_id: string, _data: Partial<Owner>): Promise<void> {
    throw new Error("Method not implemented.");
  }
  deleteOwner(_id: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
