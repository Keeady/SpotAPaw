import { sendTelemetryEvent, type TelemetryEventData } from "./telemetry-event";

const mockEvents = [
  {
    correlation_id: "123",
    event: "sighting_list_event",
    step: "request_start",
    timestamp: 100,
    status: "success",
    data: {
      user_type: "test",
    },
  },
  {
    correlation_id: "123",
    event: "sighting_list_event",
    step: "request_sent",
    timestamp: 200,
    status: "success",
  },
  {
    correlation_id: "123",
    event: "sighting_list_event",
    step: "request_completed",
    timestamp: 350,
    status: "success",
    data: {
      count: 10,
    },
  },
] as TelemetryEventData[];

const mockSendTelemetryEvent = jest.fn();
jest.mock("@/db/repositories/telemetry-repository", () => {
  return {
    TelemetryRepository: jest.fn().mockImplementation(() => {
      return {
        sendTelemetryEvent: (events: any[]) => mockSendTelemetryEvent(events),
      };
    }),
  };
});

jest.mock("@/components/logs", () => ({
  log: jest.fn(),
}));

jest.mock("@/components/util", () => ({
  createErrorLogMessageAsync: jest.fn(),
}));

describe("TelemetryEvent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should send telemetry events successfully", async () => {
    await sendTelemetryEvent(mockEvents);
    expect(mockSendTelemetryEvent).toHaveBeenCalledWith([
      {
        correlation_id: "123",
        event: "sighting_list_event",
        duration_ms: 250,
        data: {
          user_type: "test",
          count: 10,
        },
        steps: [
          {
            duration_ms: 100,
            step: "request_start",
            start: 100,
            end: 200,
            status: "success",
          },
          {
            duration_ms: 150,
            step: "request_sent",
            start: 200,
            end: 350,
            status: "success",
          },
          {
            duration_ms: 0,
            step: "request_completed",
            start: 350,
            end: 0,
            status: "success",
          },
        ],
      },
    ]);
  });

  it("should handle multiple correlation ids correctly", async () => {
    const events = [
      {
        correlation_id: "1234",
        event: "sighting_list_event",
        step: "request_start",
        timestamp: 100,
        status: "success",
        data: {
          user_type: "test",
        },
      },
      mockEvents[0],
      mockEvents[1],
      {
        correlation_id: "1234",
        event: "sighting_list_event",
        step: "request_completed",
        timestamp: 1000,
        status: "success",
        data: {
          user_type: "test",
        },
      },
      mockEvents[2],
      {
        correlation_id: "1234",
        event: "sighting_list_event",
        step: "request_sent",
        timestamp: 300,
        status: "failed",
      },
    ] as TelemetryEventData[];

    await sendTelemetryEvent(events);
    expect(mockSendTelemetryEvent).toHaveBeenCalledWith([
      {
        correlation_id: "1234",
        event: "sighting_list_event",
        duration_ms: 900,
        data: {
          user_type: "test",
        },
        steps: [
          {
            duration_ms: 200,
            step: "request_start",
            start: 100,
            end: 300,
            status: "success",
          },
          {
            duration_ms: 700,
            step: "request_sent",
            start: 300,
            end: 1000,
            status: "failed",
          },
          {
            duration_ms: 0,
            step: "request_completed",
            start: 1000,
            end: 0,
            status: "success",
          },
        ],
      },
      {
        correlation_id: "123",
        event: "sighting_list_event",
        duration_ms: 250,
        data: {
          user_type: "test",
          count: 10,
        },
        steps: [
          {
            duration_ms: 100,
            step: "request_start",
            start: 100,
            end: 200,
            status: "success",
          },
          {
            duration_ms: 150,
            step: "request_sent",
            start: 200,
            end: 350,
            status: "success",
          },
          {
            duration_ms: 0,
            step: "request_completed",
            start: 350,
            end: 0,
            status: "success",
          },
        ],
      },
    ]);
  });

  it("should handle request with sub-requests correctly as one", async () => {
    const mockEvents = [
      {
        correlation_id: "123",
        event: "sighting_list_event",
        step: "request_start",
        timestamp: 100,
        status: "success",
        data: {
          user_type: "test",
        },
      },
      {
        correlation_id: "123",
        event: "sighting_list_event",
        step: "request_sent",
        timestamp: 200,
        status: "success",
        data: {
          sub_request: "fetch_sighting_summary",
        },
      },
      {
        correlation_id: "123",
        event: "sighting_list_event",
        step: "request_sent",
        timestamp: 200,
        status: "success",
        data: {
          sub_request: "fetch_sighting_timeline",
        },
      },
      {
        correlation_id: "123",
        event: "sighting_list_event",
        step: "request_completed",
        timestamp: 350,
        status: "success",
        data: {
          count: 10,
          sub_request: "fetch_sighting_summary",
        },
      },
      {
        correlation_id: "123",
        event: "sighting_list_event",
        step: "request_completed",
        timestamp: 400,
        status: "success",
        data: {
          count: 10,
          sub_request: "fetch_sighting_timeline",
        },
      },
      {
        correlation_id: "123",
        event: "sighting_list_event",
        step: "request_completed",
        timestamp: 500,
        status: "success",
        data: {
          count: 10,
        },
      },
    ] as TelemetryEventData[];

    await sendTelemetryEvent(mockEvents);
    expect(mockSendTelemetryEvent).toHaveBeenCalledWith([
      {
        correlation_id: "123",
        event: "sighting_list_event",
        duration_ms: 400,
        data: {
          user_type: "test",
          count: 10,
          sub_request: "fetch_sighting_timeline"
        },
        steps: [
          {
            duration_ms: 100,
            step: "request_start",
            start: 100,
            end: 200,
            status: "success",
          },
          {
            duration_ms: 300,
            step: "request_sent",
            start: 200,
            end: 500,
            status: "success",
          },
          {
            duration_ms: 0,
            step: "request_completed",
            start: 500,
            end: 0,
            status: "success",
          },
        ],
      },
    ]);
  });
});
