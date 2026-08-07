import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import { Text } from "react-native";
import { Provider as PaperProvider } from "react-native-paper";
import ContactSetting from "./contact-setting";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) => key,
  }),
}));

const MockIcon = () => <Text testID="icon">Icon</Text>;
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <PaperProvider settings={{ icon: MockIcon }}>{children}</PaperProvider>
);

const mockOnOpenContact = jest.fn();

describe("ContactSetting Component", () => {
  const defaultProps = {
    iconColorContact: "#007AFF",
    onOpenContact: () => mockOnOpenContact(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly with all required elements", () => {
    const { getByText } = render(
      <TestWrapper>
        <ContactSetting {...defaultProps} />
      </TestWrapper>,
    );

    expect(getByText("contactUs")).toBeTruthy();
    expect(getByText("getInTouchWithUs")).toBeTruthy();
    expect(getByText("Icon")).toBeTruthy();
  });

  it("displays the correct title", () => {
    const { getByText } = render(
      <TestWrapper>
        <ContactSetting {...defaultProps} />
      </TestWrapper>,
    );

    expect(getByText("contactUs")).toBeTruthy();
  });

  it("displays the correct description", () => {
    const { getByText } = render(
      <TestWrapper>
        <ContactSetting {...defaultProps} />
      </TestWrapper>,
    );

    expect(getByText("getInTouchWithUs")).toBeTruthy();
  });

  it("renders icon in the left section", () => {
    const { getByText } = render(
      <TestWrapper>
        <ContactSetting {...defaultProps} />
      </TestWrapper>,
    );

    expect(getByText("Icon")).toBeTruthy();
  });

  it("calls onOpenContact when List.Item is pressed", () => {
    const mockOnOpenContact = jest.fn();
    const props = {
      ...defaultProps,
      onOpenContact: mockOnOpenContact,
    };

    const { getByText } = render(
      <TestWrapper>
        <ContactSetting {...props} />
      </TestWrapper>,
    );

    const listItem = getByText("contactUs");
    fireEvent.press(listItem);

    expect(mockOnOpenContact).toHaveBeenCalledTimes(1);
  });

  it("calls onOpenContact when description is pressed", () => {
    const mockOnOpenContact = jest.fn();
    const props = {
      ...defaultProps,
      onOpenContact: mockOnOpenContact,
    };

    const { getByText } = render(
      <TestWrapper>
        <ContactSetting {...props} />
      </TestWrapper>,
    );

    const description = getByText("getInTouchWithUs");
    fireEvent.press(description);

    expect(mockOnOpenContact).toHaveBeenCalledTimes(1);
  });

  it("handles multiple presses", () => {
    const mockOnOpenContact = jest.fn();
    const props = {
      ...defaultProps,
      onOpenContact: mockOnOpenContact,
    };

    const { getByText } = render(
      <TestWrapper>
        <ContactSetting {...props} />
      </TestWrapper>,
    );

    const listItem = getByText("contactUs");

    fireEvent.press(listItem);
    fireEvent.press(listItem);
    fireEvent.press(listItem);

    expect(mockOnOpenContact).toHaveBeenCalledTimes(3);
  });

  it("does not call onOpenContact on initial render", () => {
    const mockOnOpenContact = jest.fn();
    const props = {
      ...defaultProps,
      onOpenContact: mockOnOpenContact,
    };

    render(
      <TestWrapper>
        <ContactSetting {...props} />
      </TestWrapper>,
    );

    expect(mockOnOpenContact).not.toHaveBeenCalled();
  });

  it("handles undefined onOpenContact prop gracefully", () => {
    const props = {
      iconColorContact: "#007AFF",
      onOpenContact: undefined,
    };

    const { getByText } = render(
      <TestWrapper>
        <ContactSetting {...props} />
      </TestWrapper>,
    );

    expect(getByText("contactUs")).toBeTruthy();
    expect(getByText("getInTouchWithUs")).toBeTruthy();

    // Should not throw error when pressed
    const listItem = getByText("contactUs");
    expect(() => fireEvent.press(listItem)).not.toThrow();
  });
});
