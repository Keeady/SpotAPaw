import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import { Provider as PaperProvider } from "react-native-paper";
import  AboutSection  from "./about-section";
import { Text } from "react-native";

jest.mock("i18next", () => ({
  t: (key: string, options?: any) => key,
}));

const MockIcon = () => <Text testID="icon">Icon</Text>;
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <PaperProvider settings={{icon: MockIcon}}>{children}</PaperProvider>
);

describe("AboutSection Component", () => {
  const mockOnPress = jest.fn();
  const testIconColor = "#007AFF";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly with all required elements", () => {
    const { getByText } = render(
      <TestWrapper>
        <AboutSection
          onPress={mockOnPress}
          iconColorInformation={testIconColor}
        />
      </TestWrapper>,
    );

    expect(getByText("about")).toBeTruthy();
    expect(getByText("aboutSpotapaw")).toBeTruthy();
    expect(getByText("learnMoreAboutTheApp")).toBeTruthy();
    fireEvent.press(getByText("aboutSpotapaw"));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
    expect(getByText("Icon")).toBeTruthy();
  });
});
