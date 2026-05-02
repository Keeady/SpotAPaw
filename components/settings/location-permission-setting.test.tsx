import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import { Text } from "react-native";
import { Provider as PaperProvider } from "react-native-paper";
import LocationPermissionSetting from "./location-permission-setting";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options: any) => key,
  }),
}));

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

    expect(getByText("locationPermission")).toBeTruthy();
    expect(getByText(defaultProps.locationPermissionDescription)).toBeTruthy();
    expect(getByText(defaultProps.locationPermissionStatusDisplayText)).toBeTruthy();
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
      getByText(props.locationPermissionDescription),
    ).toBeTruthy();
  });

  it("displays the correct button text", () => {
    const props = {
      ...defaultProps,
      locationPermissionStatusDisplayText: "granted",
    };

    const { getByText } = render(
      <TestWrapper>
        <LocationPermissionSetting {...props} />
      </TestWrapper>,
    );

    expect(getByText("granted")).toBeTruthy();
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
    expect(button).toBeDisabled();
  });

  it("does not render permission granted dialog when hidden", () => {
    const { queryByText } = render(
      <TestWrapper>
        <LocationPermissionSetting {...defaultProps} />
      </TestWrapper>,
    );

    expect(queryByText("permissionGranted")).toBeNull();
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

    expect(getByText("permissionGranted")).toBeTruthy();
    expect(
      getByText(
        "locationPermissionEnabled",
      ),
    ).toBeTruthy();
    expect(getByText("ok")).toBeTruthy();
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

    const okButton = getByText("ok");
    fireEvent.press(okButton);

    expect(mockSetPermissionGrantedDialogVisible).toHaveBeenCalledWith(false);
  });

  it("does not render permission denied dialog when hidden", () => {
    const { queryByText } = render(
      <TestWrapper>
        <LocationPermissionSetting {...defaultProps} />
      </TestWrapper>,
    );

    expect(queryByText("grantLocationPermission")).toBeNull();
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

    expect(getByText("grantLocationPermission")).toBeTruthy();
    expect(
      getByText(
        "turningOnLocationMobile"
      ),
    ).toBeTruthy();
    expect(getByText("cancel")).toBeTruthy();
    expect(getByText("openSettings")).toBeTruthy();
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

    const cancelButton = getByText("cancel");
    fireEvent.press(cancelButton);

    expect(mockSetPermissionDeniedDialogVisible).toHaveBeenCalledWith(false);
  });

  it("handles different button states", () => {
    const testCases = [
      { text: "grant", disabled: false },
      { text: "granted", disabled: true },
      { text: "requestPermission", disabled: false },
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

    expect(getByTextGranted("permissionGranted")).toBeTruthy();

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

    expect(getByTextDenied("grantLocationPermission")).toBeTruthy();
  });
});
