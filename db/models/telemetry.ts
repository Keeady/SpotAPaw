export type TelemetryEventName =
  | "sighting_list_event"
  | "sighting_detail_event"
  | "sighting_create_event";

export type TelemetryEventAddData = {
  user_type?: string;
  is_ai_enabled?: boolean;
  count?: number;
  total_count?: number;
  error_message?: string;
};

export type TelemetryEventStep =
  | "request_start"
  | "request_sent"
  | "request_received"
  | "request_queued"
  | "request_task_start"
  | "request_task_completed"
  | "request_response_sent"
  | "request_response_received"
  | "request_completed";

export type TelemetryErrorType =
  | "fetch_error"
  | "network_error"
  | "server_error"
  | "validation_error"
  | "unknown_error";

export type TelemetryEventStepData = {
    step: TelemetryEventStep,
    duration_ms: number,
    start: number,
    end: number,
    status: "success" | "failed",
}

export interface TelemetryEvent {
  correlation_id: string;
  event: TelemetryEventName;
  steps: TelemetryEventStepData[];
  duration_ms: number;
  data?: TelemetryEventAddData;
}
