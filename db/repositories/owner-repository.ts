import { IOwnerRepository } from "./base-owner-repository";
import { Owner } from "../models/owner";
import { SupabaseOwnerRepository } from "./supabase/owner-repository";
import { supabase } from "@/components/supabase-client";

export class OwnerRepository implements IOwnerRepository {
  getOwner(id: string): Promise<Owner> {
    const repository = new SupabaseOwnerRepository(supabase);
    return repository.getOwner(id);
  }
  createOwner(data: Partial<Owner>): Promise<string> {
    const repository = new SupabaseOwnerRepository(supabase);
    return repository.createOwner(data);
  }
  updateOwner(id: string, data: Partial<Owner>): Promise<void> {
    const repository = new SupabaseOwnerRepository(supabase);
    return repository.updateOwner(id, data);
  }
  deleteOwner(id: string): Promise<void> {
    const repository = new SupabaseOwnerRepository(supabase);
    return repository.deleteOwner(id);
  }
}
