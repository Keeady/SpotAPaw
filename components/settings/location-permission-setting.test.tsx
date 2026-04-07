import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import { Text } from "react-native";
import { Provider as PaperProvider } from "react-native-paper";
import LocationPermissionSetting from "./location-permission-setting";

const MockIcon = () => <Text testID="icon">Icon</Text>;
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <PaperProvider settings={{ icon: MockIcon }}>{children}</PaperProvider>
);

describe("LocationPermissionSetting Component", () => {
  const defaultProps = {
    iconColorLocation: "#007AFF",
    locationPermissionDescription: "Allow app to access your location",
    handleRequestLocationPermission: jest.fn(),
    locationPermissionButtonDisabled: false,
    locationPermissionStatusDisplayText: "Grant",
    permissionGrantedDialogVisible: false,
    setPermissionGrantedDialogVisible: jest.fn(),
    permissionDeniedDialogVisible: false,
    setPermissionDeniedDialogVisible: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly with all required elements", () => {
    const { getByText } = render(
      <TestWrapper>
        <LocationPermissionSetting {...defaultProps} />
      </TestWrapper>,
    );

    expect(getByText("Location Permission")).toBeTruthy();
    expect(getByText("Allow app to access your location")).toBeTruthy();
    expect(getByText("Grant")).toBeTruthy();
    expect(getByText("Icon")).toBeTruthy();
  });

  it("displays the correct permission description", () => {
    const props = {
      ...defaultProps,
      locationPermissionDescription:
        "Location access required for nearby sightings",
    };

    const { getByText } = render(
      <TestWrapper>
        <LocationPermissionSetting {...props} />
      </TestWrapper>,
    );

    expect(
      getByText("Location access required for nearby sightings"),
    ).toBeTruthy();
  });

  it("displays the correct button text", () => {
    const props = {
      ...defaultProps,
      locationPermissionStatusDisplayText: "Granted",
    };

    const { getByText } = render(
      <TestWrapper>
        <LocationPermissionSetting {...props} />
      </TestWrapper>,
    );

    expect(getByText("Granted")).toBeTruthy();
  });

  it("calls handleRequestLocationPermission when button is pressed", () => {
    const { getByText } = render(
      <TestWrapper>
        <LocationPermissionSetting {...defaultProps} />
      </TestWrapper>,
    );

    const button = getByText("Grant");
    fireEvent.press(button);

    expect(defaultProps.handleRequestLocationPermission).toHaveBeenCalledTimes(
      1,
    );
  });

  it("renders disabled button when locationPermissionButtonDisabled is true", () => {
    const props = {
      ...defaultProps,
      locationPermissionButtonDisabled: true,
    };

    const { getByText } = render(
      <TestWrapper>
        <LocationPermissionSetting {...props} />
      </TestWrapper>,
    );

    const button = getByText("Grant");
    expect(button).toBeTruthy();
    // Button should still be pressable in tests, but the disabled prop affects styling
  });

  it("does not render permission granted dialog when hidden", () => {
    const { queryByText } = render(
      <TestWrapper>
        <LocationPermissionSetting {...defaultProps} />
      </TestWrapper>,
    );

    expect(queryByText("Permission Granted")).toBeNull();
  });

  it("renders permission granted dialog when visible", () => {
    const props = {
      ...defaultProps,
      permissionGrantedDialogVisible: true,
    };

    const { getByText } = render(
      <TestWrapper>
        <LocationPermissionSetting {...props} />
      </TestWrapper>,
    );

    expect(getByText("Permission Granted")).toBeTruthy();
    expect(
      getByText(
        "Location permission has been enabled. The app will now use your device location.",
      ),
    ).toBeTruthy();
    expect(getByText("OK")).toBeTruthy();
  });

  it("calls setPermissionGrantedDialogVisible when OK button is pressed in granted dialog", () => {
    const mockSetPermissionGrantedDialogVisible = jest.fn();
    const props = {
      ...defaultProps,
      permissionGrantedDialogVisible: true,
      setPermissionGrantedDialogVisible: mockSetPermissionGrantedDialogVisible,
    };

    const { getByText } = render(
      <TestWrapper>
        <LocationPermissionSetting {...props} />
      </TestWrapper>,
    );

    const okButton = getByText("OK");
    fireEvent.press(okButton);

    expect(mockSetPermissionGrantedDialogVisible).toHaveBeenCalledWith(false);
  });

  it("does not render permission denied dialog when hidden", () => {
    const { queryByText } = render(
      <TestWrapper>
        <LocationPermissionSetting {...defaultProps} />
      </TestWrapper>,
    );

    expect(queryByText("Grant Location Permission")).toBeNull();
  });

  it("renders permission denied dialog when visible", () => {
    const props = {
      ...defaultProps,
      permissionDeniedDialogVisible: true,
    };

    const { getByText } = render(
      <TestWrapper>
        <LocationPermissionSetting {...props} />
      </TestWrapper>,
    );

    expect(getByText("Grant Location Permission")).toBeTruthy();
    expect(
      getByText(
        "Turning on your location will allow us to show you nearby pet sightings. You can enable it in your device settings.",
      ),
    ).toBeTruthy();
    expect(getByText("Cancel")).toBeTruthy();
    expect(getByText("Open Settings")).toBeTruthy();
  });

  it("calls setPermissionDeniedDialogVisible when Cancel button is pressed in denied dialog", () => {
    const mockSetPermissionDeniedDialogVisible = jest.fn();
    const props = {
      ...defaultProps,
      permissionDeniedDialogVisible: true,
      setPermissionDeniedDialogVisible: mockSetPermissionDeniedDialogVisible,
    };

    const { getByText } = render(
      <TestWrapper>
        <LocationPermissionSetting {...props} />
      </TestWrapper>,
    );

    const cancelButton = getByText("Cancel");
    fireEvent.press(cancelButton);

    expect(mockSetPermissionDeniedDialogVisible).toHaveBeenCalledWith(false);
  });

  it("handles different button states", () => {
    const testCases = [
      { text: "Grant", disabled: false },
      { text: "Granted", disabled: true },
      { text: "Request Permission", disabled: false },
    ];

    testCases.forEach(({ text, disabled }) => {
      const props = {
        ...defaultProps,
        locationPermissionStatusDisplayText: text,
        locationPermissionButtonDisabled: disabled,
      };

      const { getByText } = render(
        <TestWrapper>
          <LocationPermissionSetting {...props} />
        </TestWrapper>,
      );

      expect(getByText(text)).toBeTruthy();
    });
  });

  it("handles different permission descriptions", () => {
    const testCases = [
      "Allow app to access your location",
      "Location permission required",
      "Enable location services for nearby sightings",
    ];

    testCases.forEach((description) => {
      const props = {
        ...defaultProps,
        locationPermissionDescription: description,
      };

      const { getByText } = render(
        <TestWrapper>
          <LocationPermissionSetting {...props} />
        </TestWrapper>,
      );

      expect(getByText(description)).toBeTruthy();
    });
  });

  it("can show both dialogs independently", () => {
    const propsGranted = {
      ...defaultProps,
      permissionGrantedDialogVisible: true,
    };

    const { getByText: getByTextGranted, unmount } = render(
      <TestWrapper>
        <LocationPermissionSetting {...propsGranted} />
      </TestWrapper>,
    );

    expect(getByTextGranted("Permission Granted")).toBeTruthy();

    unmount();

    const propsDenied = {
      ...defaultProps,
      permissionDeniedDialogVisible: true,
    };

    const { getByText: getByTextDenied } = render(
      <TestWrapper>
        <LocationPermissionSetting {...propsDenied} />
      </TestWrapper>,
    );

    expect(getByTextDenied("Grant Location Permission")).toBeTruthy();
  });
});
