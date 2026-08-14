import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
} from "react";
import { sendTelemetryEvent, TelemetryEventData } from "./telemetry-event";
import type { InstrumentProps } from "./telemetry-event";
import { log } from "@/components/logs";
import { v4 as uuidv4 } from "uuid";

type ContextProps = {
  instrument: (props: InstrumentProps) => void;
  startInstrument: (props: InstrumentProps) => void;
  completeInstrument: (props: InstrumentProps) => void;
};

const TelemetryProviderContext = createContext<Partial<ContextProps>>({});

interface Props {
  children: React.ReactNode;
}

const TelemetryProvider = (props: Props) => {
  const instruments = React.useRef<TelemetryEventData[]>([]);
  const correlationId = React.useRef<string>("");

  const generateCorrelationId = useCallback(() => {
    const timestamp = new Date().getTime();
    const newCorrelationId = uuidv4() + "-" + timestamp; // Generate a unique correlation ID using UUID and timestamp
    return newCorrelationId;
  }, []);

  const startInstrument = useCallback(
    ({ eventName, step, eventData, errorType }: InstrumentProps) => {
      if (!eventName) {
        log("Telemetry event name is required.");
        return;
      }

      if (!step) {
        log("Telemetry event step is required.");
        return;
      }

      const timestamp = new Date().getTime();
      correlationId.current = generateCorrelationId(); // Generate a unique correlation ID for the event;

      instruments.current = [
        ...instruments.current,
        {
          correlation_id: correlationId.current,
          event: eventName,
          step: step,
          timestamp: timestamp,
          data: eventData,
          error_type: errorType,
        },
      ];
    },
    [generateCorrelationId],
  );

  const completeInstrument = useCallback(
    ({ eventName, step, eventData, errorType }: InstrumentProps) => {
      if (!eventName) {
        log("Telemetry event name is required.");
        return;
      }

      if (!step) {
        log("Telemetry event step is required.");
        return;
      }

      if (!correlationId.current) {
        log("No correlation ID found. Please call startInstrument first.");
        return;
      }

      const timestamp = new Date().getTime();

      instruments.current = [
        ...instruments.current,
        {
          correlation_id: correlationId.current,
          event: eventName,
          step: step,
          timestamp: timestamp,
          data: eventData,
          error_type: errorType,
        },
      ];

      onComplete(); // Send the telemetry event to the server or logging system
    },
    [],
  );

  const instrument = useCallback(
    ({ eventName, step, eventData, errorType }: InstrumentProps) => {
      if (!eventName) {
        log("Telemetry event name is required.");
        return;
      }

      if (!step) {
        log("Telemetry event step is required.");
        return;
      }

      if (!correlationId.current) {
        log("No correlation ID found. Please call startInstrument first.");
        return;
      }

      const timestamp = new Date().getTime();

      instruments.current = [
        ...instruments.current,
        {
          correlation_id: correlationId.current,
          event: eventName,
          step: step,
          timestamp: timestamp,
          data: eventData,
          error_type: errorType,
        },
      ];
    },
    [instruments, correlationId],
  );

  const onComplete = useCallback(() => {
    sendTelemetryEvent(instruments.current);

    instruments.current = [];
  }, []);

  useEffect(() => {
    return () => {
      if (instruments.current.length > 0) {
        onComplete();
      }
    };
  }, []);

  return (
    <TelemetryProviderContext.Provider
      value={{ instrument, startInstrument, completeInstrument }}
    >
      {props.children}
    </TelemetryProviderContext.Provider>
  );
};

const useTelemetryProvider = () => {
  const context = useContext(TelemetryProviderContext);
  if (!context) {
    throw new Error(
      "useTelemetryProvider must be used within a TelemetryProvider",
    );
  }
  return context as ContextProps;
};

export { TelemetryProvider, useTelemetryProvider };
