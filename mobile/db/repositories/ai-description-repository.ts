import { supabase } from "@/components/supabase-client";
import { IAiDescriptionRepository } from "./base-ai-description-repository";
import { SupabaseAiDescriptionRepository } from "./supabase/ai-description-repository";
import { AiDescription } from "../models/aiDescription";

export class AiDescriptionRepository implements IAiDescriptionRepository {
    getAiDescription(id: string): Promise<AiDescription | null> {
        const repository = new SupabaseAiDescriptionRepository(supabase);
        return repository.getAiDescription(id);
    }
}