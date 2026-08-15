import { render, waitFor } from "@testing-library/react-native";
import { Text } from "react-native";
import SightingPage from "./sighting-page";
import { AuthContext } from "../Provider/auth-provider";
import { PermissionContext } from "../Provider/permission-provider";
import { TelemetryProviderContext } from "@/instrumentation/telemetry-provider";

jest.mock("@/components/Provider/auth-provider", () => {
  const React = jest.requireActual("react");
  const fakeUser = { id: "test-user-id" };
  const AuthContext = React.createContext({ user: fakeUser });

  return {
    AuthContext,
  };
});

const mockGetSavedLocation = jest.fn();

jest.mock("../Provider/permission-provider", () => {
  const React = jest.requireActual("react");
  const PermissionContext = React.createContext({
    enabledLocationPermission: true,
    getSavedLocation: mockGetSavedLocation,
  });

  return {
    PermissionContext,
  };
});

jest.mock("./sighting-location-manager", () => {
  return {
    SightingLocationManager: () => "SightingLocationManager",
  };
});

const mockHandleAddingSighting = jest.fn();
jest.mock("./sighting-handler", () => {
  return {
    handleAddingSighting: (...args: any[]) => mockHandleAddingSighting(...args),
  };
});

jest.mock("../logs", () => ({
  log: jest.fn(),
}));

jest.mock("../util", () => ({
  createErrorLogMessage: jest.fn(),
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => {
    return {
      t: jest.fn((key) => key),
    };
  },
}));

const mockGetSightings = jest.fn();
jest.mock("@/db/repositories/sighting-repository", () => ({
  SightingRepository: jest.fn().mockImplementation(() => ({
    createSighting: jest.fn(),
    updateSighting: jest.fn(),
    getSighting: jest.fn(),
    getSightings: () => mockGetSightings(),
    getSightingsByReporter: jest.fn(),
    getSightingsByPetId: jest.fn(),
    getLinkedSightings: jest.fn(),
    getSightingByLinkedSightingId: jest.fn(),
    updateSightingStatusByPet: jest.fn(),
  })),
}));

const mockInstrument = jest.fn();
const mockCompleteInstrument = jest.fn();
jest.mock("@/instrumentation/telemetry-provider", () => {
  const React = jest.requireActual("react");
  const TelemetryContext = React.createContext({
    instrument: () => mockInstrument(),
    completeInstrument: () => mockCompleteInstrument(),
  });

  return {
    useTelemetryProvider: () => React.useContext(TelemetryContext),
    TelemetryProviderContext: TelemetryContext,
  };
});

const defaultRenderer = () => <Text>Default Renderer</Text>;
const fakeUser = { id: "test-user-id" } as any;
const fakeLocation = { latitude: 37.7749, longitude: -122.4194 } as any;

const TestWrapper = ({
  children,
  user = fakeUser,
  location = fakeLocation,
}: {
  children: React.ReactNode;
  user?: any;
  location?: any;
}) => {
  return (
    <TelemetryProviderContext.Provider
      value={{
        instrument: () => mockInstrument(),
        completeInstrument: () => mockCompleteInstrument(),
      }}
    >
      <AuthContext.Provider value={{ user }}>
        <PermissionContext.Provider
          value={{
            enabledLocationPermission: true,
            getSavedLocation: mockGetSavedLocation,
            location,
          }}
        >
          {children}
        </PermissionContext.Provider>
      </AuthContext.Provider>
    </TelemetryProviderContext.Provider>
  );
};

describe("SightingPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing", async () => {
    mockGetSightings.mockResolvedValue({
      data: [],
      count: 0,
    });

    const { findByText, getByText } = render(
      <TestWrapper>
        <SightingPage renderer={defaultRenderer} />
      </TestWrapper>,
    );

    expect(getByText("loadingNearbySightings")).toBeTruthy();
    await waitFor(() => {
      expect(mockGetSightings).toHaveBeenCalled();
      expect(mockInstrument).toHaveBeenCalled();
      expect(mockCompleteInstrument).toHaveBeenCalled();
    });
    expect(await findByText("showingNearbySightings")).toBeTruthy();
    expect(await findByText("Default Renderer")).toBeTruthy();
  });
});
