import * as Sentry from "@sentry/react-native";
import { InstrumentEventData } from "./telemetry";

export function captureSuccess(
  span: Sentry.Span,
  eventData: InstrumentEventData,
) {
  span.setAttributes(eventData);
  span.setAttribute("status", "success");
  span.end();
}

export function captureFailure(
  span: Sentry.Span,
  eventData: InstrumentEventData,
) {
  span.setAttributes(eventData);
  span.setAttribute("status", "failed");
  span.end();
}

export function captureError(error: unknown, context: Record<string, unknown>) {
  Sentry.captureException(error, {
    extra: context,
  });
}

export function startMetric(
  eventName: string,
  eventData?: InstrumentEventData,
) {
  return Sentry.startInactiveSpan({
    name: eventName,
    attributes: eventData,
  });
}

export function captureFeedback(feedback: Sentry.SendFeedbackParams) {
  Sentry.captureFeedback(feedback)
}