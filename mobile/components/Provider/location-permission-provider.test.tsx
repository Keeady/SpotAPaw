import { render, waitFor } from "@testing-library/react-native";
import { useContext } from "react";
import { PermissionContext, PermissionProvider } from "./permission-provider";
import { Text } from "react-native";

const mockGetExistingUserLocation = jest.fn();
const mockGetCurrentUserLocationV3 = jest.fn();
const mockSaveLocation = jest.fn();
const mockGetSavedLocation = jest.fn();

jest.mock("../get-current-location", () => ({
  getExistingUserLocation: () => mockGetExistingUserLocation(),
  getCurrentUserLocationV3: () => mockGetCurrentUserLocationV3(),
  saveLocation: (location: any) => mockSaveLocation(location),
  getSavedLocation: () => mockGetSavedLocation(),
}));

const MockLocationPermissionDeniedDialog = () => (
  <Text>LocationPermissionDeniedDialog</Text>
);
jest.mock("../location-request-util", () => ({
  LocationPermissionDeniedDialog: () => <MockLocationPermissionDeniedDialog />,
}));

jest.mock("../logs", () => ({
  log: jest.fn(),
}));

describe("PermissionProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("provides the correct location permission status when getExistingUserLocation resolves with a location", async () => {
    const mockLocation = { latitude: 40.7128, longitude: -74.006 };
    mockGetExistingUserLocation.mockResolvedValue(mockLocation);
    let contextValue: any;
    const TestComponent = () => {
      contextValue = useContext(PermissionContext);
      return null;
    };

    render(
      <PermissionProvider>
        <TestComponent />
      </PermissionProvider>,
    );

    await waitFor(() => {
      expect(contextValue).toBeDefined();
      expect(contextValue.enabledLocationPermission).toBe(true);
      expect(contextValue.location).toEqual(mockLocation);
      expect(contextValue.isLoadingLocation).toBe(false);
      expect(mockGetSavedLocation).not.toHaveBeenCalled();
    });
  });

  it("provides the correct location permission status when getExistingUserLocation rejects", async () => {
    const mockLocation = { latitude: 40.7128, longitude: -74.006 };
    mockGetExistingUserLocation.mockRejectedValue(
      new Error("Permission denied"),
    );
    mockGetSavedLocation.mockResolvedValue(mockLocation);
    let contextValue: any;
    const TestComponent = () => {
      contextValue = useContext(PermissionContext);
      return null;
    };

    render(
      <PermissionProvider>
        <TestComponent />
      </PermissionProvider>,
    );

    await waitFor(() => {
      expect(contextValue).toBeDefined();
      expect(contextValue.enabledLocationPermission).toBe(false);
      expect(mockGetSavedLocation).toHaveBeenCalled();
      expect(contextValue.isLoadingLocation).toBe(false);
      expect(contextValue.location).toEqual(mockLocation);
    });
  });

  it("provides the correct location permission status when getExistingUserLocation returns empty", async () => {
    const mockLocation = { latitude: 40.7128, longitude: -74.006 };
    mockGetExistingUserLocation.mockResolvedValue(null);
    mockGetSavedLocation.mockResolvedValue(mockLocation);
    let contextValue: any;
    const TestComponent = () => {
      contextValue = useContext(PermissionContext);
      return null;
    };

    render(
      <PermissionProvider>
        <TestComponent />
      </PermissionProvider>,
    );

    await waitFor(() => {
      expect(contextValue).toBeDefined();
      expect(contextValue.enabledLocationPermission).toBe(true);
      expect(mockGetSavedLocation).toHaveBeenCalled();
      expect(contextValue.isLoadingLocation).toBe(false);
      expect(contextValue.location).toEqual(mockLocation);
    });
  });

  it("provides the correct location permission status when getExistingUserLocation rejects and getSavedLocation returns empty", async () => {
    mockGetExistingUserLocation.mockRejectedValue(
      new Error("Permission denied"),
    );
    mockGetSavedLocation.mockResolvedValue(null);
    let contextValue: any;
    const TestComponent = () => {
      contextValue = useContext(PermissionContext);
      return null;
    };

    render(
      <PermissionProvider>
        <TestComponent />
      </PermissionProvider>,
    );

    await waitFor(() => {
      expect(contextValue).toBeDefined();
      expect(contextValue.enabledLocationPermission).toBe(false);
      expect(mockGetSavedLocation).toHaveBeenCalled();
      expect(contextValue.isLoadingLocation).toBe(false);
      expect(contextValue.location).toBeUndefined();
    });
  });

  it("refreshes permission and saves location when refreshPermission is called and getCurrentUserLocationV3 resolves with a location", async () => {
    const mockLocation = { latitude: 40.7128, longitude: -74.006 };
    mockGetCurrentUserLocationV3.mockResolvedValue(mockLocation);
    let contextValue: any;
    const TestComponent = () => {
      contextValue = useContext(PermissionContext);
      return null;
    };

    render(
      <PermissionProvider>
        <TestComponent />
      </PermissionProvider>,
    );

    await waitFor(() => {
      expect(contextValue).toBeDefined();
      contextValue.refreshPermission();
      expect(mockGetCurrentUserLocationV3).toHaveBeenCalled();
      expect(contextValue.enabledLocationPermission).toBe(true);
      expect(contextValue.location).toEqual(mockLocation);
      expect(mockSaveLocation).toHaveBeenCalledWith(mockLocation);
      expect(contextValue.isLoadingLocation).toBe(false);
    });
  });

  it("refreshes permission and shows permission denied dialog when refreshPermission is called and getCurrentUserLocationV3 resolves with null", async () => {
    mockGetCurrentUserLocationV3.mockResolvedValue(null);
    let contextValue: any;
    const TestComponent = () => {
      contextValue = useContext(PermissionContext);
      return null;
    };

    render(
      <PermissionProvider>
        <TestComponent />
      </PermissionProvider>,
    );

    await waitFor(() => {
      expect(contextValue).toBeDefined();
      contextValue.refreshPermission();
      expect(mockGetCurrentUserLocationV3).toHaveBeenCalled();
      expect(contextValue.enabledLocationPermission).toBe(true);
      expect(mockGetSavedLocation).toHaveBeenCalled();
      expect(contextValue.isLoadingLocation).toBe(false);
    });
  });

  it("refreshes permission and shows permission denied dialog when refreshPermission is called and getCurrentUserLocationV3 rejects", async () => {
    mockGetCurrentUserLocationV3.mockRejectedValue(
      new Error("Permission denied"),
    );
    let contextValue: any;
    const TestComponent = () => {
      contextValue = useContext(PermissionContext);
      return null;
    };

    const { getByText } = render(
      <PermissionProvider>
        <TestComponent />
      </PermissionProvider>,
    );

    await waitFor(() => {
      expect(contextValue).toBeDefined();
      contextValue.refreshPermission();
      expect(mockGetCurrentUserLocationV3).toHaveBeenCalled();
      expect(contextValue.enabledLocationPermission).toBe(false);
      expect(mockGetSavedLocation).toHaveBeenCalled();
      expect(contextValue.isLoadingLocation).toBe(false);
      expect(getByText("LocationPermissionDeniedDialog")).toBeTruthy();
    });
  });

  
});
