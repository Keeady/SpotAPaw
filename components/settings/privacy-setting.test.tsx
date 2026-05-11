import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import { Text } from "react-native";
import { Provider as PaperProvider } from "react-native-paper";
import PrivacySetting from "./privacy-setting";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) => key,
  }),
}));

const MockIcon = () => <Text testID="icon">Icon</Text>;
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <PaperProvider settings={{ icon: MockIcon }}>{children}</PaperProvider>
);

describe("PrivacySetting Component", () => {
  const defaultProps = {
    iconColorPrivacy: "#007AFF",
    onOpenPrivacyPolicy: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly with all required elements", () => {
    const { getByText } = render(
      <TestWrapper>
        <PrivacySetting {...defaultProps} />
      </TestWrapper>,
    );

    expect(getByText("privacyPolicy")).toBeTruthy();
    expect(getByText("learnHowWeHandleYourData")).toBeTruthy();
    expect(getByText("Icon")).toBeTruthy();
  });

  it("displays the correct title", () => {
    const { getByText } = render(
      <TestWrapper>
        <PrivacySetting {...defaultProps} />
      </TestWrapper>,
    );

    expect(getByText("privacyPolicy")).toBeTruthy();
  });

  it("displays the correct description", () => {
    const { getByText } = render(
      <TestWrapper>
        <PrivacySetting {...defaultProps} />
      </TestWrapper>,
    );

    expect(getByText("learnHowWeHandleYourData")).toBeTruthy();
  });

  it("renders icon in the left section", () => {
    const { getByText } = render(
      <TestWrapper>
        <PrivacySetting {...defaultProps} />
      </TestWrapper>,
    );

    expect(getByText("Icon")).toBeTruthy();
  });

  it("calls onOpenPrivacyPolicy when List.Item is pressed", () => {
    const mockOnOpenPrivacyPolicy = jest.fn();
    const props = {
      ...defaultProps,
      onOpenPrivacyPolicy: mockOnOpenPrivacyPolicy,
    };

    const { getByText } = render(
      <TestWrapper>
        <PrivacySetting {...props} />
      </TestWrapper>,
    );

    const listItem = getByText("privacyPolicy");
    fireEvent.press(listItem);

    expect(mockOnOpenPrivacyPolicy).toHaveBeenCalledTimes(1);
  });

  it("calls onOpenPrivacyPolicy when description is pressed", () => {
    const mockOnOpenPrivacyPolicy = jest.fn();
    const props = {
      ...defaultProps,
      onOpenPrivacyPolicy: mockOnOpenPrivacyPolicy,
    };

    const { getByText } = render(
      <TestWrapper>
        <PrivacySetting {...props} />
      </TestWrapper>,
    );

    const description = getByText("learnHowWeHandleYourData");
    fireEvent.press(description);

    expect(mockOnOpenPrivacyPolicy).toHaveBeenCalledTimes(1);
  });

  it("handles multiple presses", () => {
    const mockOnOpenPrivacyPolicy = jest.fn();
    const props = {
      ...defaultProps,
      onOpenPrivacyPolicy: mockOnOpenPrivacyPolicy,
    };

    const { getByText } = render(
      <TestWrapper>
        <PrivacySetting {...props} />
      </TestWrapper>,
    );

    const listItem = getByText("privacyPolicy");

    fireEvent.press(listItem);
    fireEvent.press(listItem);
    fireEvent.press(listItem);

    expect(mockOnOpenPrivacyPolicy).toHaveBeenCalledTimes(3);
  });

  it("does not call onOpenPrivacyPolicy on initial render", () => {
    const mockOnOpenPrivacyPolicy = jest.fn();
    const props = {
      ...defaultProps,
      onOpenPrivacyPolicy: mockOnOpenPrivacyPolicy,
    };

    render(
      <TestWrapper>
        <PrivacySetting {...props} />
      </TestWrapper>,
    );

    expect(mockOnOpenPrivacyPolicy).not.toHaveBeenCalled();
  });

  it("handles undefined onOpenPrivacyPolicy prop gracefully", () => {
    const props = {
      iconColorPrivacy: "#007AFF",
      onOpenPrivacyPolicy: undefined,
    };

    const { getByText } = render(
      <TestWrapper>
        <PrivacySetting {...props} />
      </TestWrapper>,
    );

    expect(getByText("privacyPolicy")).toBeTruthy();
    expect(getByText("learnHowWeHandleYourData")).toBeTruthy();

    // Should not throw error when pressed
    const listItem = getByText("privacyPolicy");
    expect(() => fireEvent.press(listItem)).not.toThrow();
  });
});
