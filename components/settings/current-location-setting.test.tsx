import { render } from "@testing-library/react-native";
import React from "react";
import { Text } from "react-native";
import { Provider as PaperProvider } from "react-native-paper";
import CurrentLocationSetting from "./current-location-setting";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue: string) => defaultValue,
  }),
}));

const MockIcon = () => <Text testID="icon">Icon</Text>;
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <PaperProvider settings={{ icon: MockIcon }}>{children}</PaperProvider>
);

describe("CurrentLocationSetting Component", () => {
  const testIconColor = "#007AFF";
  const testLocationText = "New York, NY";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly with all required elements", () => {
    const { getByText } = render(
      <TestWrapper>
        <CurrentLocationSetting
          iconColorLocationCheck={testIconColor}
          locationUsedDisplayText={testLocationText}
        />
      </TestWrapper>,
    );

    expect(getByText("Current Location")).toBeTruthy();
    expect(getByText(testLocationText)).toBeTruthy();
    expect(getByText("Icon")).toBeTruthy();
  });

  it("renders with different location text", () => {
    const alternativeLocationText = "San Francisco, CA";
    const { getByText } = render(
      <TestWrapper>
        <CurrentLocationSetting
          iconColorLocationCheck={testIconColor}
          locationUsedDisplayText={alternativeLocationText}
        />
      </TestWrapper>,
    );

    expect(getByText("Current Location")).toBeTruthy();
    expect(getByText(alternativeLocationText)).toBeTruthy();
  });

  it("renders with custom icon color", () => {
    const customIconColor = "#FF6B6B";
    const { getByText } = render(
      <TestWrapper>
        <CurrentLocationSetting
          iconColorLocationCheck={customIconColor}
          locationUsedDisplayText={testLocationText}
        />
      </TestWrapper>,
    );

    // Verify the component still renders correctly with custom color
    expect(getByText("Current Location")).toBeTruthy();
    expect(getByText(testLocationText)).toBeTruthy();
  });

  it("renders with empty location text", () => {
    const { getByText } = render(
      <TestWrapper>
        <CurrentLocationSetting
          iconColorLocationCheck={testIconColor}
          locationUsedDisplayText=""
        />
      </TestWrapper>,
    );

    expect(getByText("Current Location")).toBeTruthy();
  });

  it("renders with long location text", () => {
    const longLocationText =
      "Very Long Location Name That Should Still Display Correctly, United States of America";
    const { getByText } = render(
      <TestWrapper>
        <CurrentLocationSetting
          iconColorLocationCheck={testIconColor}
          locationUsedDisplayText={longLocationText}
        />
      </TestWrapper>,
    );

    expect(getByText("Current Location")).toBeTruthy();
    expect(getByText(longLocationText)).toBeTruthy();
  });
});
