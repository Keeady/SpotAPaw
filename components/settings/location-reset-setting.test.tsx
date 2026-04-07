import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import { Text } from "react-native";
import { Provider as PaperProvider } from "react-native-paper";
import LocationResetSetting from "./location-reset-setting";

const MockIcon = () => <Text testID="icon">Icon</Text>;
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <PaperProvider settings={{ icon: MockIcon }}>{children}</PaperProvider>
);

describe("LocationResetSetting Component", () => {
  const defaultProps = {
    iconColorLocationRemove: "#FF6B6B",
    setResetLocationDialogVisible: jest.fn(),
    resetLocationDialogVisible: false,
    locationResetSuccessDialogVisible: false,
    setLocationResetSuccessDialogVisible: jest.fn(),
    handleResetSavedLocation: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly with all required elements", () => {
    const { getByText } = render(
      <TestWrapper>
        <LocationResetSetting {...defaultProps} />
      </TestWrapper>,
    );

    expect(getByText("Reset Saved Location")).toBeTruthy();
    expect(getByText("Remove your manually selected location")).toBeTruthy();
    expect(getByText("Reset")).toBeTruthy();
    expect(getByText("Icon")).toBeTruthy();
  });

  it("calls setResetLocationDialogVisible when Reset button is pressed", () => {
    const { getByText, getByTestId } = render(
      <TestWrapper>
        <LocationResetSetting {...defaultProps} />
      </TestWrapper>,
    );

    const resetButton = getByTestId("reset-button");
    fireEvent.press(resetButton);

    expect(defaultProps.setResetLocationDialogVisible).toHaveBeenCalledWith(
      true,
    );
  });

  it("does not render confirmation dialog when hidden", () => {
    const { queryByText } = render(
      <TestWrapper>
        <LocationResetSetting {...defaultProps} />
      </TestWrapper>,
    );

    expect(queryByText("Reset Saved Location?")).toBeNull();
  });

  it("renders confirmation dialog when visible", () => {
    const props = {
      ...defaultProps,
      resetLocationDialogVisible: true,
    };

    const { getByText, getByTestId } = render(
      <TestWrapper>
        <LocationResetSetting {...props} />
      </TestWrapper>,
    );

    expect(getByText("Reset Saved Location?")).toBeTruthy();
    expect(
      getByText(
        "This will remove your manually selected location. You will need to select a new location from the map or grant location permission.",
      ),
    ).toBeTruthy();
    expect(getByText("Cancel")).toBeTruthy();
    expect(getByTestId("reset-confirm-button")).toBeTruthy();
  });

  it("calls setResetLocationDialogVisible when Cancel button is pressed in confirmation dialog", () => {
    const mockSetResetLocationDialogVisible = jest.fn();
    const props = {
      ...defaultProps,
      resetLocationDialogVisible: true,
      setResetLocationDialogVisible: mockSetResetLocationDialogVisible,
    };

    const { getByText } = render(
      <TestWrapper>
        <LocationResetSetting {...props} />
      </TestWrapper>,
    );

    const cancelButton = getByText("Cancel");
    fireEvent.press(cancelButton);

    expect(mockSetResetLocationDialogVisible).toHaveBeenCalledWith(false);
  });

  it("calls handleResetSavedLocation when Reset button is pressed in confirmation dialog", () => {
    const mockHandleResetSavedLocation = jest.fn();
    const props = {
      ...defaultProps,
      resetLocationDialogVisible: true,
      handleResetSavedLocation: mockHandleResetSavedLocation,
    };

    const { getByTestId } = render(
      <TestWrapper>
        <LocationResetSetting {...props} />
      </TestWrapper>,
    );

    // Get the Reset button inside the dialog (second one)
    const dialogResetButton = getByTestId("reset-confirm-button");
    fireEvent.press(dialogResetButton);

    expect(mockHandleResetSavedLocation).toHaveBeenCalledTimes(1);
  });

  it("does not render success dialog when hidden", () => {
    const { queryByText } = render(
      <TestWrapper>
        <LocationResetSetting {...defaultProps} />
      </TestWrapper>,
    );

    expect(queryByText("Location Reset")).toBeNull();
  });

  it("renders success dialog when visible", () => {
    const props = {
      ...defaultProps,
      locationResetSuccessDialogVisible: true,
    };

    const { getByText } = render(
      <TestWrapper>
        <LocationResetSetting {...props} />
      </TestWrapper>,
    );

    expect(getByText("Location Reset")).toBeTruthy();
    expect(
      getByText(
        "Your saved location has been removed. You can select a new location from the map.",
      ),
    ).toBeTruthy();
    expect(getByText("OK")).toBeTruthy();
  });

  it("calls setLocationResetSuccessDialogVisible when OK button is pressed in success dialog", () => {
    const mockSetLocationResetSuccessDialogVisible = jest.fn();
    const props = {
      ...defaultProps,
      locationResetSuccessDialogVisible: true,
      setLocationResetSuccessDialogVisible:
        mockSetLocationResetSuccessDialogVisible,
    };

    const { getByText } = render(
      <TestWrapper>
        <LocationResetSetting {...props} />
      </TestWrapper>,
    );

    const okButton = getByText("OK");
    fireEvent.press(okButton);

    expect(mockSetLocationResetSuccessDialogVisible).toHaveBeenCalledWith(
      false,
    );
  });

  it("can show both dialogs independently", () => {
    const propsConfirmation = {
      ...defaultProps,
      resetLocationDialogVisible: true,
    };

    const { getByText: getByTextConfirmation, unmount } = render(
      <TestWrapper>
        <LocationResetSetting {...propsConfirmation} />
      </TestWrapper>,
    );

    expect(getByTextConfirmation("Reset Saved Location?")).toBeTruthy();

    unmount();

    const propsSuccess = {
      ...defaultProps,
      locationResetSuccessDialogVisible: true,
    };

    const { getByText: getByTextSuccess } = render(
      <TestWrapper>
        <LocationResetSetting {...propsSuccess} />
      </TestWrapper>,
    );

    expect(getByTextSuccess("Location Reset")).toBeTruthy();
  });

  it("handles dialog visibility states correctly", () => {
    const testCases = [
      {
        resetDialogVisible: true,
        successDialogVisible: false,
        shouldShowReset: true,
        shouldShowSuccess: false,
      },
      {
        resetDialogVisible: false,
        successDialogVisible: true,
        shouldShowReset: false,
        shouldShowSuccess: true,
      },
      {
        resetDialogVisible: false,
        successDialogVisible: false,
        shouldShowReset: false,
        shouldShowSuccess: false,
      },
    ];

    testCases.forEach(
      ({
        resetDialogVisible,
        successDialogVisible,
        shouldShowReset,
        shouldShowSuccess,
      }) => {
        const props = {
          ...defaultProps,
          resetLocationDialogVisible: resetDialogVisible,
          locationResetSuccessDialogVisible: successDialogVisible,
        };

        const { queryByText, unmount } = render(
          <TestWrapper>
            <LocationResetSetting {...props} />
          </TestWrapper>,
        );

        if (shouldShowReset) {
          expect(queryByText("Reset Saved Location?")).toBeTruthy();
        } else {
          expect(queryByText("Reset Saved Location?")).toBeNull();
        }

        if (shouldShowSuccess) {
          expect(queryByText("Location Reset")).toBeTruthy();
        } else {
          expect(queryByText("Location Reset")).toBeNull();
        }

        unmount();
      },
    );
  });

  it("handles proper button interaction workflow", () => {
    const mockSetResetLocationDialogVisible = jest.fn();
    const mockHandleResetSavedLocation = jest.fn();
    const mockSetLocationResetSuccessDialogVisible = jest.fn();

    const { getByText, rerender, getByTestId } = render(
      <TestWrapper>
        <LocationResetSetting
          {...defaultProps}
          setResetLocationDialogVisible={mockSetResetLocationDialogVisible}
          handleResetSavedLocation={mockHandleResetSavedLocation}
          setLocationResetSuccessDialogVisible={
            mockSetLocationResetSuccessDialogVisible
          }
        />
      </TestWrapper>,
    );

    // Step 1: Click initial Reset button
    const initialResetButton = getByTestId("reset-button");
    fireEvent.press(initialResetButton);
    expect(mockSetResetLocationDialogVisible).toHaveBeenCalledWith(true);

    // Step 2: Render with confirmation dialog visible
    rerender(
      <TestWrapper>
        <LocationResetSetting
          {...defaultProps}
          resetLocationDialogVisible={true}
          setResetLocationDialogVisible={mockSetResetLocationDialogVisible}
          handleResetSavedLocation={mockHandleResetSavedLocation}
          setLocationResetSuccessDialogVisible={
            mockSetLocationResetSuccessDialogVisible
          }
        />
      </TestWrapper>,
    );

    // Step 3: Click Reset button in dialog
    const dialogResetButton = getByTestId("reset-confirm-button");
    fireEvent.press(dialogResetButton);
    expect(mockHandleResetSavedLocation).toHaveBeenCalledTimes(1);
  });
});
