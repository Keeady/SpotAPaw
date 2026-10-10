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
        duration_ms: duration,
        ...eventData,
        ...data,
        status: "success",
      });
    },

    failure(data: InstrumentEventData) {
      const duration = performance.now() - startTime;

      captureFailure(span, {
        duration_ms: duration,
        ...eventData,
        ...data,
        status: "failed",
      });
    },
  };
}
