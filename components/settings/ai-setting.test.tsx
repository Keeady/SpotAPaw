import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import { Provider as PaperProvider } from "react-native-paper";
import AISetting from "./ai-setting";
import { Text } from "react-native";

const MockIcon = () => <Text testID="icon">Icon</Text>;
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <PaperProvider settings={{icon: MockIcon}}>{children}</PaperProvider>
);

describe("AISetting Component", () => {
  const mockOnToggleAIFeature = jest.fn();
  const testIconColor = "#007AFF";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly with all required elements", () => {
    const { getByText } = render(
      <TestWrapper>
        <AISetting
          iconColorAI={testIconColor}
          aiFeatureEnabled={false}
          onToggleAIFeature={mockOnToggleAIFeature}
        />
      </TestWrapper>,
    );

    expect(getByText("AI Image Analysis")).toBeTruthy();
    expect(
      getByText("Enable image analysis for pet identification"),
    ).toBeTruthy();
    expect(getByText("Icon")).toBeTruthy();
  });

  it("renders switch with correct value when AI feature is enabled", () => {
    const { getByTestId } = render(
      <TestWrapper>
        <AISetting
          iconColorAI={testIconColor}
          aiFeatureEnabled={true}
          onToggleAIFeature={mockOnToggleAIFeature}
        />
      </TestWrapper>,
    );

    const switchElement = getByTestId("ai-switch");
    expect(switchElement.props.value).toBe(true);
  });

  it("renders switch with correct value when AI feature is disabled", () => {
    const { getByTestId } = render(
      <TestWrapper>
        <AISetting
          iconColorAI={testIconColor}
          aiFeatureEnabled={false}
          onToggleAIFeature={mockOnToggleAIFeature}
        />
      </TestWrapper>,
    );

    const switchElement = getByTestId("ai-switch");
    expect(switchElement.props.value).toBe(false);
  });

  it("calls onToggleAIFeature when switch is toggled", () => {
    const { getByTestId } = render(
      <TestWrapper>
        <AISetting
          iconColorAI={testIconColor}
          aiFeatureEnabled={false}
          onToggleAIFeature={mockOnToggleAIFeature}
        />
      </TestWrapper>,
    );

    const switchElement = getByTestId("ai-switch");
    fireEvent(switchElement, "onValueChange", true);

    expect(mockOnToggleAIFeature).toHaveBeenCalledTimes(1);
    expect(mockOnToggleAIFeature).toHaveBeenCalledWith(true);
  });

  it("calls onToggleAIFeature with correct value when toggling from enabled to disabled", () => {
    const { getByTestId } = render(
      <TestWrapper>
        <AISetting
          iconColorAI={testIconColor}
          aiFeatureEnabled={true}
          onToggleAIFeature={mockOnToggleAIFeature}
        />
      </TestWrapper>,
    );

    const switchElement = getByTestId("ai-switch");
    fireEvent(switchElement, "onValueChange", false);

    expect(mockOnToggleAIFeature).toHaveBeenCalledTimes(1);
    expect(mockOnToggleAIFeature).toHaveBeenCalledWith(false);
  });
});
