import { captureFailure, captureSuccess, startMetric } from "./instrument-util";
import {
  InstrumentCallbacks,
  InstrumentEventData,
  InstrumentProps,
} from "./telemetry";

export function startInstrument({
  eventName,
  eventData,
}: InstrumentProps): InstrumentCallbacks {
  const startTime = performance.now();

  const span = startMetric(eventName, eventData);

  return {
    success(data: InstrumentEventData) {
      const duration = performance.now() - startTime;

      captureSuccess(span, {
        status: "success",
        duration_ms: duration,
        ...eventData,
        ...data,
      });
    },

    failure(data: InstrumentEventData) {
      const duration = performance.now() - startTime;

      captureFailure(span, {
        status: "failed",
        duration_ms: duration,
        ...eventData,
        ...data,
      });
    },
  };
}
