import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
} from "react";
import { sendTelemetryEvent, TelemetryEventData } from "./telemetry-event";
import type { InstrumentProps } from "./telemetry-event";

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
  // const [correlationId, setCorrelationId] = React.useState<string>(""); // Generate a unique correlation ID for the session
  // const [instruments, setInstruments] = React.useState<TelemetryEvent[]>([]);

  const instruments = React.useRef<TelemetryEventData[]>([]);
  const correlationId = React.useRef<string>("");

  const generateCorrelationId = useCallback(() => {
    const timestamp = new Date().getTime();
    const newCorrelationId = `correlation-${timestamp}`;
    return newCorrelationId;
  }, []);

  const startInstrument = useCallback(
    ({ eventName, step, eventData }: InstrumentProps) => {
      if (!eventName) {
        console.error("Telemetry event name is required.");
        return;
      }

      if (!step) {
        console.error("Telemetry event step is required.");
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
        },
      ];
    },
    [generateCorrelationId],
  );

  const completeInstrument = useCallback(
    ({ eventName, step, eventData }: InstrumentProps) => {
      if (!eventName) {
        console.error("Telemetry event name is required.");
        return;
      }

      if (!step) {
        console.error("Telemetry event step is required.");
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
        },
      ];

      onComplete(); // Send the telemetry event to the server or logging system
    },
    [],
  );

  const instrument = useCallback(
    ({ eventName, step, eventData }: InstrumentProps) => {
      if (!eventName) {
        console.error("Telemetry event name is required.");
        return;
      }

      if (!step) {
        console.error("Telemetry event step is required.");
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
        },
      ];

      console.log(
        `Telemetry Event: ${correlationId.current} ${eventName} ${step} ${timestamp}`,
        eventData,
      );
    },
    [instruments, correlationId],
  );

  const onComplete = useCallback(() => {
    instruments.current.forEach((instrument) => {
      console.log(
        "Sending telemetry event: ",
        instrument.correlation_id,
        instrument.event,
        instrument.step,
        instrument.timestamp,
        instrument.data,
      );
    });

    sendTelemetryEvent(instruments.current);

    instruments.current = [];
  }, []);

  useEffect(() => {
    return () => {
      if (instruments.current.length > 0) {
        console.log(
          "Component unmounted. Sending remaining telemetry events: ",
        );
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
