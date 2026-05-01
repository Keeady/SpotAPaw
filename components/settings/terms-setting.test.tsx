import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import { Text } from "react-native";
import { Provider as PaperProvider } from "react-native-paper";
import TermsSetting from "./terms-setting";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue: string) => defaultValue,
  }),
}));

const MockIcon = () => <Text testID="icon">Icon</Text>;
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <PaperProvider settings={{ icon: MockIcon }}>{children}</PaperProvider>
);

describe("TermsSetting Component", () => {
  const defaultProps = {
    iconColorTerms: "#007AFF",
    onOpenTermsOfService: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly with all required elements", () => {
    const { getByText } = render(
      <TestWrapper>
        <TermsSetting {...defaultProps} />
      </TestWrapper>,
    );

    expect(getByText("Terms of Service")).toBeTruthy();
    expect(getByText("Read our terms and conditions")).toBeTruthy();
    expect(getByText("Icon")).toBeTruthy();
  });

  it("displays the correct title", () => {
    const { getByText } = render(
      <TestWrapper>
        <TermsSetting {...defaultProps} />
      </TestWrapper>,
    );

    expect(getByText("Terms of Service")).toBeTruthy();
  });

  it("displays the correct description", () => {
    const { getByText } = render(
      <TestWrapper>
        <TermsSetting {...defaultProps} />
      </TestWrapper>,
    );

    expect(getByText("Read our terms and conditions")).toBeTruthy();
  });

  it("renders icon in the left section", () => {
    const { getByText } = render(
      <TestWrapper>
        <TermsSetting {...defaultProps} />
      </TestWrapper>,
    );

    expect(getByText("Icon")).toBeTruthy();
  });

  it("calls onOpenTermsOfService when List.Item is pressed", () => {
    const mockOnOpenTermsOfService = jest.fn();
    const props = {
      ...defaultProps,
      onOpenTermsOfService: mockOnOpenTermsOfService,
    };

    const { getByText } = render(
      <TestWrapper>
        <TermsSetting {...props} />
      </TestWrapper>,
    );

    const listItem = getByText("Terms of Service");
    fireEvent.press(listItem);

    expect(mockOnOpenTermsOfService).toHaveBeenCalledTimes(1);
  });

  it("calls onOpenTermsOfService when description is pressed", () => {
    const mockOnOpenTermsOfService = jest.fn();
    const props = {
      ...defaultProps,
      onOpenTermsOfService: mockOnOpenTermsOfService,
    };

    const { getByText } = render(
      <TestWrapper>
        <TermsSetting {...props} />
      </TestWrapper>,
    );

    const description = getByText("Read our terms and conditions");
    fireEvent.press(description);

    expect(mockOnOpenTermsOfService).toHaveBeenCalledTimes(1);
  });

  it("handles multiple presses", () => {
    const mockOnOpenTermsOfService = jest.fn();
    const props = {
      ...defaultProps,
      onOpenTermsOfService: mockOnOpenTermsOfService,
    };

    const { getByText } = render(
      <TestWrapper>
        <TermsSetting {...props} />
      </TestWrapper>,
    );

    const listItem = getByText("Terms of Service");

    fireEvent.press(listItem);
    fireEvent.press(listItem);
    fireEvent.press(listItem);

    expect(mockOnOpenTermsOfService).toHaveBeenCalledTimes(3);
  });

  it("does not call onOpenTermsOfService on initial render", () => {
    const mockOnOpenTermsOfService = jest.fn();
    const props = {
      ...defaultProps,
      onOpenTermsOfService: mockOnOpenTermsOfService,
    };

    render(
      <TestWrapper>
        <TermsSetting {...props} />
      </TestWrapper>,
    );

    expect(mockOnOpenTermsOfService).not.toHaveBeenCalled();
  });
});
