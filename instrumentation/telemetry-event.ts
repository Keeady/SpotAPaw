import { createErrorLogMessageAsync } from "@/components/util";
import type {
  TelemetryEventName,
  TelemetryEventStep,
  TelemetryEventAddData,
  TelemetryEvent,
  TelemetryEventStepData,
} from "@/db/models/telemetry";
import { TelemetryRepository } from "@/db/repositories/telemetry-repository";

export type InstrumentProps = {
  eventName: TelemetryEventName;
  step: TelemetryEventStep;
  eventData?: TelemetryEventAddData;
};

export type TelemetryEventData = {
  correlation_id: string;
  event: TelemetryEventName;
  step: TelemetryEventStep;
  timestamp: number;
  data?: TelemetryEventAddData;
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

    aggregatedEvents.forEach((event) => {
      console.log(
        "Aggregated Telemetry Event: ",
        event.correlation_id,
        event.event,
        event.steps,
        event.duration_ms,
        event.data,
      );
    });

    const repository = new TelemetryRepository();
    await repository.sendTelemetryEvent(aggregatedEvents);
  } catch (error) {
    createErrorLogMessageAsync(error).then((message) => {
      console.log("Failed to send telemetry event:", message);
    });
    console.error("Failed to send telemetry event:", error);
  }
};

function generateSteps(events: TelemetryEventData[]): TelemetryEventStepData[] {
  // calculate duration from request_start to request_sent
  // calculate duration from request_sent to request_completed

  const requestStart = {
    duration_ms: 0,
    step: "request_start" as TelemetryEventStep,
    start: 0,
    end: 0,
  };

  const requestSent = {
    duration_ms: 0,
    step: "request_sent" as TelemetryEventStep,
    start: 0,
    end: 0,
  };

  const requestCompleted = {
    duration_ms: 0,
    step: "request_completed" as TelemetryEventStep,
    start: 0,
    end: 0,
  };

  for (const event of events) {
    if (event.step === "request_start") {
      requestStart.start = event.timestamp;
    } else if (event.step === "request_sent") {
      requestSent.start = event.timestamp;
      requestStart.end = event.timestamp;
      requestStart.duration_ms = requestStart.end - requestStart.start;
    } else if (event.step === "request_completed") {
      requestCompleted.start = event.timestamp;
      requestSent.end = event.timestamp;
      requestSent.duration_ms = requestSent.end - requestSent.start;
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
