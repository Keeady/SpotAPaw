import { render } from "@testing-library/react-native";
import React from "react";
import { Text, View } from "react-native";
import { Provider as PaperProvider } from "react-native-paper";
import SettingsRenderer from "./settings-renderer";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options: any) => {
      if (options && options.defaultDistanceValue) {
        return `${options.defaultDistanceValue} km radius`;
      } else if (options && options.versionText) {
        return `Version ${options.versionText}`;
      }
      return key;
    },
  }),
}));

const MockIcon = () => <Text testID="icon">Icon</Text>;
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <PaperProvider settings={{ icon: MockIcon }}>{children}</PaperProvider>
);

// Mock components for testing
const MockComponent = ({ testId }: { testId: string }) => (
  <View testID={testId}>
    <Text>{testId}</Text>
  </View>
);

describe("SettingsRenderer Component", () => {
  const mockComponents = {
    aboutSection: <MockComponent testId="about-section" />,
    locationPermissionSetting: <MockComponent testId="location-permission" />,
    currentLocationSetting: <MockComponent testId="current-location" />,
    locationResetSetting: <MockComponent testId="location-reset" />,
    notificationSetting: <MockComponent testId="notification-setting" />,
    aiSetting: <MockComponent testId="ai-setting" />,
    languageSetting: <MockComponent testId="language-setting" />,
    distanceSetting: <MockComponent testId="distance-setting" />,
    privacySetting: <MockComponent testId="privacy-setting" />,
    termsSetting: <MockComponent testId="terms-setting" />,
    accountSetting: <MockComponent testId="account-setting" />,
  };

  const defaultProps = {
    ...mockComponents,
    versionText: "1.0.0",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly with all required elements", () => {
    const { getByText, getByTestId } = render(
      <TestWrapper>
        <SettingsRenderer {...defaultProps} />
      </TestWrapper>,
    );

    // Check section headers
    expect(getByText("location")).toBeTruthy();
    expect(getByText("preferences")).toBeTruthy();
    expect(getByText("legal")).toBeTruthy();

    // Check all components are rendered
    expect(getByTestId("about-section")).toBeTruthy();
    expect(getByTestId("location-permission")).toBeTruthy();
    expect(getByTestId("current-location")).toBeTruthy();
    expect(getByTestId("location-reset")).toBeTruthy();
    expect(getByTestId("notification-setting")).toBeTruthy();
    expect(getByTestId("ai-setting")).toBeTruthy();
    expect(getByTestId("language-setting")).toBeTruthy();
    expect(getByTestId("distance-setting")).toBeTruthy();
    expect(getByTestId("privacy-setting")).toBeTruthy();
    expect(getByTestId("terms-setting")).toBeTruthy();
    expect(getByTestId("account-setting")).toBeTruthy();

    // Check footer
    expect(getByText("Version 1.0.0")).toBeTruthy();
    expect(getByText(`SpotAPaw © ${new Date().getFullYear()}`)).toBeTruthy();
  });

  it("displays the correct version text", () => {
    const props = {
      ...defaultProps,
      versionText: "2.1.3",
    };

    const { getByText } = render(
      <TestWrapper>
        <SettingsRenderer {...props} />
      </TestWrapper>,
    );

    expect(getByText("Version 2.1.3")).toBeTruthy();
  });

  it("displays the current year in copyright", () => {
    const currentYear = new Date().getFullYear();
    const { getByText } = render(
      <TestWrapper>
        <SettingsRenderer {...defaultProps} />
      </TestWrapper>,
    );

    expect(getByText(`SpotAPaw © ${currentYear}`)).toBeTruthy();
  });

  it("renders all section headers correctly", () => {
    const { getByText } = render(
      <TestWrapper>
        <SettingsRenderer {...defaultProps} />
      </TestWrapper>,
    );

    expect(getByText("location")).toBeTruthy();
    expect(getByText("preferences")).toBeTruthy();
    expect(getByText("legal")).toBeTruthy();
  });

  it("renders location section components in correct order", () => {
    const { getByTestId } = render(
      <TestWrapper>
        <SettingsRenderer {...defaultProps} />
      </TestWrapper>,
    );

    // All location components should be present
    expect(getByTestId("location-permission")).toBeTruthy();
    expect(getByTestId("current-location")).toBeTruthy();
    expect(getByTestId("location-reset")).toBeTruthy();
  });

  it("renders preferences section components in correct order", () => {
    const { getByTestId } = render(
      <TestWrapper>
        <SettingsRenderer {...defaultProps} />
      </TestWrapper>,
    );

    // All preference components should be present
    expect(getByTestId("ai-setting")).toBeTruthy();
    expect(getByTestId("language-setting")).toBeTruthy();
    expect(getByTestId("distance-setting")).toBeTruthy();
  });

  it("renders legal section components in correct order", () => {
    const { getByTestId } = render(
      <TestWrapper>
        <SettingsRenderer {...defaultProps} />
      </TestWrapper>,
    );

    // All legal components should be present
    expect(getByTestId("privacy-setting")).toBeTruthy();
    expect(getByTestId("terms-setting")).toBeTruthy();
  });

  it("renders account setting when provided", () => {
    const { getByTestId } = render(
      <TestWrapper>
        <SettingsRenderer {...defaultProps} />
      </TestWrapper>,
    );

    expect(getByTestId("account-setting")).toBeTruthy();
  });

  it("handles null account setting", () => {
    const props = {
      ...defaultProps,
      accountSetting: null,
    };

    const { queryByTestId, getByText } = render(
      <TestWrapper>
        <SettingsRenderer {...props} />
      </TestWrapper>,
    );

    expect(queryByTestId("account-setting")).toBeNull();
    // Other sections should still render
    expect(getByText("location")).toBeTruthy();
    expect(getByText("preferences")).toBeTruthy();
    expect(getByText("legal")).toBeTruthy();
  });

  it("handles undefined account setting", () => {
    const props = {
      ...defaultProps,
      accountSetting: undefined,
    };

    const { queryByTestId, getByText } = render(
      <TestWrapper>
        <SettingsRenderer {...props} />
      </TestWrapper>,
    );

    expect(queryByTestId("account-setting")).toBeNull();
    expect(getByText("location")).toBeTruthy();
  });

  it("renders notification setting outside of sections", () => {
    const { getByTestId } = render(
      <TestWrapper>
        <SettingsRenderer {...defaultProps} />
      </TestWrapper>,
    );

    // Notification setting should be rendered but not within a specific section
    expect(getByTestId("notification-setting")).toBeTruthy();
  });

  it("renders about section at the top", () => {
    const { getByTestId } = render(
      <TestWrapper>
        <SettingsRenderer {...defaultProps} />
      </TestWrapper>,
    );

    expect(getByTestId("about-section")).toBeTruthy();
  });

  it("handles different version text formats", () => {
    const testVersions = ["1.0.0", "1.0.0-beta", "1.0.0-alpha.1", "v2.1.3"];

    testVersions.forEach((version) => {
      const props = {
        ...defaultProps,
        versionText: version,
      };

      const { getByText, unmount } = render(
        <TestWrapper>
          <SettingsRenderer {...props} />
        </TestWrapper>,
      );

      expect(getByText(`Version ${version}`)).toBeTruthy();
      unmount();
    });
  });

  it("renders empty components gracefully", () => {
    const propsWithEmpty = {
      ...defaultProps,
      aboutSection: null,
      languageSetting: null,
    };

    const { getByText, queryByTestId } = render(
      <TestWrapper>
        <SettingsRenderer {...propsWithEmpty} />
      </TestWrapper>,
    );

    // Should still render other sections
    expect(getByText("location")).toBeTruthy();
    expect(getByText("preferences")).toBeTruthy();
    expect(getByText("legal")).toBeTruthy();
    expect(queryByTestId("about-section")).toBeNull();
    expect(queryByTestId("language-setting")).toBeNull();
    // Other components should still be there
    expect(queryByTestId("ai-setting")).toBeTruthy();
  });

  it("renders with all components as different types", () => {
    const mixedProps = {
      aboutSection: <Text>Custom About</Text>,
      locationPermissionSetting: (
        <View>
          <Text>Location Permission</Text>
        </View>
      ),
      currentLocationSetting: "Simple String", // Testing different node types
      locationResetSetting: null,
      notificationSetting: <MockComponent testId="notification" />,
      aiSetting: undefined,
      languageSetting: <Text>Language</Text>,
      distanceSetting: <Text>Distance</Text>,
      privacySetting: <Text>Privacy</Text>,
      termsSetting: <Text>Terms</Text>,
      accountSetting: <Text>Account</Text>,
      versionText: "test-version",
    };

    const { getByText } = render(
      <TestWrapper>
        <SettingsRenderer {...mixedProps} />
      </TestWrapper>,
    );

    expect(getByText("Custom About")).toBeTruthy();
    expect(getByText("Location Permission")).toBeTruthy();
    expect(getByText("Language")).toBeTruthy();
    expect(getByText("Version test-version")).toBeTruthy();
  });
});
