export type TelemetryEventName =
  | "analyze_photos_event"
  | "sighting_list_event"
  | "sighting_detail_event"
  | "sighting_create_event"
  | "pet_detail_event";

export type TelemetryErrorType =
  | "image_analysis_error"
  | "pet_submit_error"
  | "sighting_submit_error"
  | "missing_location"
  | "fetch_error"
  | "network_error"
  | "server_error"
  | "validation_error"
  | "unknown_error";

export type TelemetryEventStepStatus = "success" | "failed" | "incomplete";

export type InstrumentProps = {
  eventName: TelemetryEventName;
  eventData?: InstrumentEventData;
};

export type InstrumentCallbacks = {
  success: (data: InstrumentEventData) => void;
  failure: (data: InstrumentEventData) => void;
};

export type InstrumentEventData = {
  user_type?: string;
  is_ai_enabled?: boolean;
  count?: number;
  total_count?: number;
  source?: string;
  error_type?: TelemetryErrorType;
  error_message?: string;
  status?: TelemetryEventStepStatus;
  duration_ms?: number;
};
