import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import { Text } from "react-native";
import { Provider as PaperProvider } from "react-native-paper";
import DistanceSetting from "./distance-setting";

const MockIcon = () => <Text testID="icon">Icon</Text>;
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <PaperProvider settings={{icon: MockIcon}}>{children}</PaperProvider>
);

describe("DistanceSetting Component", () => {
  const defaultProps = {
    iconColorDistance: "#007AFF",
    defaultDistance: "25",
    selectedDistance: "10",
    onDistancePress: jest.fn(),
    distanceDialogVisible: false,
    handleDistanceChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly with all required elements", () => {
    const { getByText } = render(
      <TestWrapper>
        <DistanceSetting {...defaultProps} />
      </TestWrapper>,
    );

    expect(getByText("Default Distance")).toBeTruthy();
    expect(getByText("10 km radius")).toBeTruthy();
    expect(getByText("Icon")).toBeTruthy();
  });

  it("displays the correct distance in the description", () => {
    const props = {
      ...defaultProps,
      selectedDistance: "25",
    };

    const { getByText } = render(
      <TestWrapper>
        <DistanceSetting {...props} />
      </TestWrapper>,
    );

    expect(getByText("25 km radius")).toBeTruthy();
  });

  it("calls onDistancePress when the List.Item is pressed", () => {
    const { getByText } = render(
      <TestWrapper>
        <DistanceSetting {...defaultProps} />
      </TestWrapper>,
    );

    const listItem = getByText("Default Distance");
    fireEvent.press(listItem);

    expect(defaultProps.onDistancePress).toHaveBeenCalledTimes(1);
  });

  it("does not render the DistanceSelectionDialog when dialog is hidden", () => {
    const { queryByText } = render(
      <TestWrapper>
        <DistanceSetting {...defaultProps} />
      </TestWrapper>,
    );

    // Dialog should not be visible when distanceDialogVisible is false
    expect(queryByText("Pet Sighting Distance")).toBeNull();
  });

  it("renders the DistanceSelectionDialog when dialog is visible", async () => {
    const props = {
      ...defaultProps,
      distanceDialogVisible: true,
    };

    const { findByText } = render(
      <TestWrapper>
        <DistanceSetting {...props} />
      </TestWrapper>,
    );

    // Dialog should be visible when distanceDialogVisible is true
    expect(await findByText("Pet Sighting Distance")).toBeTruthy();
    expect(await findByText("1 km")).toBeTruthy();
    expect(await findByText("5 km")).toBeTruthy();
    expect(await findByText("10 km")).toBeTruthy();
    expect(await findByText("25 km")).toBeTruthy();
    expect(await findByText("50 km")).toBeTruthy();
    expect(await findByText("100 km")).toBeTruthy();
    expect(await findByText("Cancel")).toBeTruthy();
  });

  it("calls handleDistanceChange when a radio button is selected in the dialog", () => {
    const mockHandleDistanceChange = jest.fn();
    const props = {
      ...defaultProps,
      distanceDialogVisible: true,
      handleDistanceChange: mockHandleDistanceChange,
    };

    const { getByText } = render(
      <TestWrapper>
        <DistanceSetting {...props} />
      </TestWrapper>,
    );

    const fiveKmOption = getByText("5 km");
    fireEvent.press(fiveKmOption);

    expect(mockHandleDistanceChange).toHaveBeenCalledWith("5");
  });

  it("calls onDistancePress when Cancel button is pressed in the dialog", () => {
    const mockOnDistancePress = jest.fn();
    const props = {
      ...defaultProps,
      distanceDialogVisible: true,
      onDistancePress: mockOnDistancePress,
    };

    const { getByText } = render(
      <TestWrapper>
        <DistanceSetting {...props} />
      </TestWrapper>,
    );

    const cancelButton = getByText("Cancel");
    fireEvent.press(cancelButton);

    expect(mockOnDistancePress).toHaveBeenCalledTimes(1);
  });

  it("renders with different selectedDistance values", () => {
    const testCases = ["1", "5", "50", "100"];

    testCases.forEach((distance) => {
      const props = {
        ...defaultProps,
        selectedDistance: distance,
      };

      const { getByText } = render(
        <TestWrapper>
          <DistanceSetting {...props} />
        </TestWrapper>,
      );

      expect(getByText(`${distance} km radius`)).toBeTruthy();
    });
  });

  it("handles edge case with empty selectedDistance", () => {
    const props = {
      ...defaultProps,
      selectedDistance: "",
    };

    const { getByText } = render(
      <TestWrapper>
        <DistanceSetting {...props} />
      </TestWrapper>,
    );

    expect(getByText("25 km radius")).toBeTruthy();
  });

  it("handles edge case with zero selectedDistance", () => {
    const props = {
      ...defaultProps,
      selectedDistance: "0",
    };

    const { getByText } = render(
      <TestWrapper>
        <DistanceSetting {...props} />
      </TestWrapper>,
    );

    expect(getByText("0 km radius")).toBeTruthy();
  });
});
