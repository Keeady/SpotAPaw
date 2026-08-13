import { log } from "@/components/logs";
import { createErrorLogMessageAsync } from "@/components/util";
import type {
  TelemetryEventName,
  TelemetryEventStep,
  TelemetryEventAddData,
  TelemetryEvent,
  TelemetryEventStepData,
  TelemetryErrorType,
} from "@/db/models/telemetry";
import { TelemetryRepository } from "@/db/repositories/telemetry-repository";

export type InstrumentProps = {
  eventName: TelemetryEventName;
  step: TelemetryEventStep;
  eventData?: TelemetryEventAddData;
  errorType?: TelemetryErrorType;
};

export type TelemetryEventData = {
  correlation_id: string;
  event: TelemetryEventName;
  step: TelemetryEventStep;
  timestamp: number;
  data?: TelemetryEventAddData;
  error_type?: TelemetryErrorType;
};

export const sendTelemetryEvent = async (events: TelemetryEventData[]) => {
  try {
    const aggregatedEvents: TelemetryEvent[] = [];

    // Aggregate events by correlation_id and event name
    const eventMap: Record<string, TelemetryEventData[]> = {};

    for (const event of events) {
      const key = `${event.correlation_id}-${event.event}`;
      if (!eventMap[key]) {
        eventMap[key] = [event];
      } else {
        eventMap[key].push(event);
      }
    }

    // Convert the eventMap to aggregatedEvents with steps, total duration
    for (const key in eventMap) {
      const eventsForKey = eventMap[key];
      const steps = generateSteps(eventsForKey);
      const totalDuration = steps.reduce(
        (acc, step) => acc + (step.duration_ms || 0),
        0,
      );
      const mergedData = mergeEventData(eventsForKey);

      aggregatedEvents.push({
        correlation_id: eventsForKey[0].correlation_id,
        event: eventsForKey[0].event,
        steps: steps,
        duration_ms: totalDuration,
        data: mergedData,
      });
    }

    const repository = new TelemetryRepository();
    await repository.sendTelemetryEvent(aggregatedEvents);
  } catch (error) {
    createErrorLogMessageAsync(error).then((message) => {
      log(`Failed to send telemetry event: ${message}`);
    });
  }
};

function generateSteps(events: TelemetryEventData[]): TelemetryEventStepData[] {
  const requestStart = {
    duration_ms: 0,
    step: "request_start",
    start: 0,
    end: 0,
    status: "success",
  } as TelemetryEventStepData;

  const requestSent = {
    duration_ms: 0,
    step: "request_sent",
    start: 0,
    end: 0,
    status: "success",
  } as TelemetryEventStepData;

  const requestCompleted = {
    duration_ms: 0,
    step: "request_completed",
    start: 0,
    end: 0,
    status: "success",
  } as TelemetryEventStepData;

  for (const event of events) {
    const status = event.error_type ? "failed" : "success";
    if (event.step === "request_start") {
      requestStart.start = event.timestamp;
      requestStart.status = status;
    } else if (event.step === "request_sent") {
      requestSent.start = event.timestamp;
      requestStart.end = event.timestamp;
      requestStart.duration_ms = requestStart.end - requestStart.start;
      requestSent.status = status;
    } else if (event.step === "request_completed") {
      requestCompleted.start = event.timestamp;
      requestSent.end = event.timestamp;
      requestSent.duration_ms = requestSent.end - requestSent.start;
      requestCompleted.status = status;
    }
  }

  return [requestStart, requestSent, requestCompleted];
}

function mergeEventData(events: TelemetryEventData[]): TelemetryEventAddData {
  const mergedData: TelemetryEventAddData = {};

  for (const event of events) {
    if (event.data) {
      Object.assign(mergedData, event.data);
    }
  }

  return mergedData;
}
