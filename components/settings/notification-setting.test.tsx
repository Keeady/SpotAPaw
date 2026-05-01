import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import { Text } from "react-native";
import { Provider as PaperProvider } from "react-native-paper";
import NotificationSetting from "./notification-setting";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options: any) => key,
  }),
}));

const MockIcon = () => <Text testID="icon">Icon</Text>;
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <PaperProvider settings={{ icon: MockIcon }}>{children}</PaperProvider>
);

describe("NotificationSetting Component", () => {
  const defaultProps = {
    iconColorNotification: "#007AFF",
    notificationsEnabled: false,
    onNotificationPress: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly with all required elements", () => {
    const { getByText, getByTestId } = render(
      <TestWrapper>
        <NotificationSetting {...defaultProps} />
      </TestWrapper>,
    );

    expect(getByText("notifications")).toBeTruthy();
    expect(getByText("pushNotifications")).toBeTruthy();
    expect(getByText("getNotifiedAboutUpdatesAndEvents")).toBeTruthy();
    expect(getByText("Icon")).toBeTruthy();
    expect(getByTestId("notification-switch")).toBeTruthy();
  });

  it("renders with notifications disabled", () => {
    const { getByTestId } = render(
      <TestWrapper>
        <NotificationSetting {...defaultProps} />
      </TestWrapper>,
    );

    const switchComponent = getByTestId("notification-switch");
    expect(switchComponent.props.value).toBe(false);
  });

  it("renders with notifications enabled", () => {
    const props = {
      ...defaultProps,
      notificationsEnabled: true,
    };

    const { getByTestId } = render(
      <TestWrapper>
        <NotificationSetting {...props} />
      </TestWrapper>,
    );

    const switchComponent = getByTestId("notification-switch");
    expect(switchComponent.props.value).toBe(true);
  });

  it("calls onNotificationPress with true when switch is turned on", () => {
    const mockOnNotificationPress = jest.fn();
    const props = {
      ...defaultProps,
      notificationsEnabled: false,
      onNotificationPress: mockOnNotificationPress,
    };

    const { getByTestId } = render(
      <TestWrapper>
        <NotificationSetting {...props} />
      </TestWrapper>,
    );

    const switchComponent = getByTestId("notification-switch");
    fireEvent(switchComponent, "valueChange", true);

    expect(mockOnNotificationPress).toHaveBeenCalledWith(true);
  });

  it("calls onNotificationPress with false when switch is turned off", () => {
    const mockOnNotificationPress = jest.fn();
    const props = {
      ...defaultProps,
      notificationsEnabled: true,
      onNotificationPress: mockOnNotificationPress,
    };

    const { getByTestId } = render(
      <TestWrapper>
        <NotificationSetting {...props} />
      </TestWrapper>,
    );

    const switchComponent = getByTestId("notification-switch");
    fireEvent(switchComponent, "valueChange", false);

    expect(mockOnNotificationPress).toHaveBeenCalledWith(false);
  });

  it("handles multiple switch toggles", () => {
    const mockOnNotificationPress = jest.fn();
    const props = {
      ...defaultProps,
      onNotificationPress: mockOnNotificationPress,
    };

    const { getByTestId } = render(
      <TestWrapper>
        <NotificationSetting {...props} />
      </TestWrapper>,
    );

    const switchComponent = getByTestId("notification-switch");

    // Toggle on
    fireEvent(switchComponent, "valueChange", true);
    expect(mockOnNotificationPress).toHaveBeenCalledWith(true);

    // Toggle off
    fireEvent(switchComponent, "valueChange", false);
    expect(mockOnNotificationPress).toHaveBeenCalledWith(false);

    expect(mockOnNotificationPress).toHaveBeenCalledTimes(2);
  });

  it("renders List.Section with correct subheader", () => {
    const { getByText } = render(
      <TestWrapper>
        <NotificationSetting {...defaultProps} />
      </TestWrapper>,
    );

    expect(getByText("notifications")).toBeTruthy();
  });

  it("renders List.Item with correct title and description", () => {
    const { getByText } = render(
      <TestWrapper>
        <NotificationSetting {...defaultProps} />
      </TestWrapper>,
    );

    expect(getByText("pushNotifications")).toBeTruthy();
    expect(getByText("getNotifiedAboutUpdatesAndEvents")).toBeTruthy();
  });

  it("renders icon in the left section", () => {
    const { getByText } = render(
      <TestWrapper>
        <NotificationSetting {...defaultProps} />
      </TestWrapper>,
    );

    expect(getByText("Icon")).toBeTruthy();
  });

  it("maintains switch state consistency", () => {
    const testCases = [
      { enabled: true, expectedValue: true },
      { enabled: false, expectedValue: false },
    ];

    testCases.forEach(({ enabled, expectedValue }) => {
      const props = {
        ...defaultProps,
        notificationsEnabled: enabled,
      };

      const { getByTestId, unmount } = render(
        <TestWrapper>
          <NotificationSetting {...props} />
        </TestWrapper>,
      );

      const switchComponent = getByTestId("notification-switch");
      expect(switchComponent.props.value).toBe(expectedValue);

      unmount();
    });
  });

  it("does not call onNotificationPress on initial render", () => {
    const mockOnNotificationPress = jest.fn();
    const props = {
      ...defaultProps,
      onNotificationPress: mockOnNotificationPress,
    };

    render(
      <TestWrapper>
        <NotificationSetting {...props} />
      </TestWrapper>,
    );

    expect(mockOnNotificationPress).not.toHaveBeenCalled();
  });
});
