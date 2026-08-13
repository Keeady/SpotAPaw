import { BaseTelemetryRepository } from "../base-telemetry-repository";
import { TelemetryEvent } from "../../models/telemetry";
import { SupabaseClient } from "@supabase/supabase-js";

export class SupabaseTelemetryRepository extends BaseTelemetryRepository {
  supabaseClient: SupabaseClient | undefined;
  constructor(supabase: SupabaseClient) {
    super();
    this.supabaseClient = supabase;
  }

  async sendTelemetryEvent(events: TelemetryEvent[]): Promise<void> {
    if (!this.supabaseClient) {
      throw new Error("Undefined supabase client");
    }

    const { error } = await this.supabaseClient.functions.invoke(
      "log-telemetry-event",
      {
        body: {
          events
        },
      },
    );

    if (error) {
      console.error("Failed to send telemetry event:", error);
      throw error;
    }
  }
}
