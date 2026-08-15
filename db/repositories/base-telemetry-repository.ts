import { TelemetryEvent } from "../models/telemetry";

export interface ITelemetryRepository {
  sendTelemetryEvent(events: TelemetryEvent[]): Promise<void>;
}

export class BaseTelemetryRepository implements ITelemetryRepository {
  async sendTelemetryEvent(_events: TelemetryEvent[]): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
