import { ITelemetryRepository } from "./base-telemetry-repository";
import { TelemetryEvent } from "../models/telemetry";
import { SupabaseTelemetryRepository } from "./supabase/telemetry-repository";
import { supabase } from "@/components/supabase-client";

export class TelemetryRepository implements ITelemetryRepository {
  async sendTelemetryEvent(events: TelemetryEvent[]): Promise<void> {
    const repository = new SupabaseTelemetryRepository(supabase);
    return repository.sendTelemetryEvent(events);
  }
}
