import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import { Provider as PaperProvider } from "react-native-paper";
import AccountSetting from "./account-setting";
import { Text } from "react-native";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options: any) => key,
  }),
}));

const MockIcon = () => <Text testID="icon">Icon</Text>;
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <PaperProvider settings={{ icon: MockIcon }}>{children}</PaperProvider>
);

describe("AccountSetting Component", () => {
  const defaultProps = {
    iconColorDelete: "#FF6B6B",
    onAccountDeletionPress: jest.fn(),
    deleteDialogVisible: false,
    setDeleteDialogVisible: jest.fn(),
    handleAccountDeletionConfirmation: jest.fn(),
    deleteConfirmationDialogVisible: false,
    setDeleteConfirmationDialogVisible: jest.fn(),
    handleConfirmationAccountDeletion: jest.fn(),
    deletingAccount: false,
    deleteConfirmationText: "",
    setDeleteConfirmationText: jest.fn(),
    errorDialogVisible: false,
    setErrorDialogVisible: jest.fn(),
    errorMessage: "",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly with all required elements", () => {
    const { getByText } = render(
      <TestWrapper>
        <AccountSetting {...defaultProps} />
      </TestWrapper>,
    );

    expect(getByText("accountManagement")).toBeTruthy();
    expect(getByText("deleteAccount")).toBeTruthy();
    expect(getByText("permanentlyDeleteYourAccountAndData")).toBeTruthy();
    expect(getByText("Icon")).toBeTruthy();
  });

  it("calls onAccountDeletionPress when delete account item is pressed", () => {
    const { getByText } = render(
      <TestWrapper>
        <AccountSetting {...defaultProps} />
      </TestWrapper>,
    );

    expect(getByText("deleteAccount")).toBeTruthy();
    const deleteAccountItem = getByText("deleteAccount");
    fireEvent.press(deleteAccountItem);

    expect(defaultProps.onAccountDeletionPress).toHaveBeenCalledTimes(1);
  });

  it("passes correct props to AccountDeletionWarningDialog", () => {
    const mockSetDeleteDialogVisible = jest.fn();
    const mockHandleAccountDeletionConfirmation = jest.fn();

    const { getByText, debug } = render(
      <TestWrapper>
        <AccountSetting
          {...defaultProps}
          deleteDialogVisible={true}
          setDeleteDialogVisible={mockSetDeleteDialogVisible}
          handleAccountDeletionConfirmation={
            mockHandleAccountDeletionConfirmation
          }
        />
      </TestWrapper>,
    );

    expect(getByText("deleteAccountTitle")).toBeTruthy();
    expect(
      getByText("thisActionCannotBeUndone"),
    ).toBeTruthy();
    expect(getByText("• permanentlyDeleteAllYourData")).toBeTruthy();
    expect(getByText("• permanentlyDeleteAllYourPetData")).toBeTruthy();
    expect(
      getByText("• removeYourSavedLocationsAndPreferences"),
    ).toBeTruthy();
    expect(getByText("• signYouOutOfAllDevices")).toBeTruthy();
    expect(getByText("areYouSureYouWantToContinue")).toBeTruthy();
    expect(getByText("cancel")).toBeTruthy();
    expect(getByText("continue")).toBeTruthy();

    const cancelButton = getByText("cancel");
    const continueButton = getByText("continue");

    fireEvent.press(cancelButton);
    expect(mockSetDeleteDialogVisible).toHaveBeenCalledWith(false);

    fireEvent.press(continueButton);
    expect(mockHandleAccountDeletionConfirmation).toHaveBeenCalledTimes(1);
  });

  it("passes correct props to AccountDeletionConfirmationDialog", () => {
    const mockSetDeleteConfirmationDialogVisible = jest.fn();
    const mockHandleConfirmationAccountDeletion = jest.fn();
    const mockSetDeleteConfirmationText = jest.fn();

    const { getByText, getByTestId, getByPlaceholderText } = render(
      <TestWrapper>
        <AccountSetting
          {...defaultProps}
          deleteConfirmationDialogVisible={true}
          setDeleteConfirmationDialogVisible={
            mockSetDeleteConfirmationDialogVisible
          }
          handleConfirmationAccountDeletion={
            mockHandleConfirmationAccountDeletion
          }
          deletingAccount={false}
          deleteConfirmationText=""
          setDeleteConfirmationText={mockSetDeleteConfirmationText}
        />
      </TestWrapper>,
    );

    expect(getByText("confirmAccountDeletion")).toBeTruthy();
    expect(
      getByTestId("confirm-delete-input-label"),
    ).toBeTruthy();
    expect(getByTestId("confirm-delete-input")).toBeTruthy();
    const deleteInput = getByTestId("confirm-delete-input");
    expect(deleteInput.props.value).toBe("");

    expect(getByTestId("confirm-delete-input-label-delete")).toBeTruthy();
    expect(getByText("cancel")).toBeTruthy();
    expect(getByTestId("confirm-delete-btn")).toBeTruthy();
    const deleteButton = getByTestId("confirm-delete-btn");
    expect(
      deleteButton.findByProps({ children: "deleteAccount" }),
    ).toBeTruthy();

    fireEvent.changeText(deleteInput, "DELETE");
    expect(mockSetDeleteConfirmationText).toHaveBeenCalledWith("DELETE");

    fireEvent.press(deleteButton);
    expect(mockHandleConfirmationAccountDeletion).not.toHaveBeenCalled();

    const cancelButton = getByText("cancel");
    fireEvent.press(cancelButton);
    expect(mockSetDeleteConfirmationDialogVisible).toHaveBeenCalledWith(false);
  });

  it("calls correct functions on user interactions in AccountDeletionConfirmationDialog", () => {
    const mockSetDeleteConfirmationDialogVisible = jest.fn();
    const mockHandleConfirmationAccountDeletion = jest.fn();
    const mockSetDeleteConfirmationText = jest.fn();

    const { getByText, getByTestId, getByPlaceholderText } = render(
      <TestWrapper>
        <AccountSetting
          {...defaultProps}
          deleteConfirmationDialogVisible={true}
          setDeleteConfirmationDialogVisible={
            mockSetDeleteConfirmationDialogVisible
          }
          handleConfirmationAccountDeletion={
            mockHandleConfirmationAccountDeletion
          }
          deletingAccount={false}
          deleteConfirmationText="DELETE"
          setDeleteConfirmationText={mockSetDeleteConfirmationText}
        />
      </TestWrapper>,
    );

    expect(getByText("confirmAccountDeletion")).toBeTruthy();
    expect(
      getByTestId("confirm-delete-input-label"),
    ).toBeTruthy();
    expect(getByTestId("confirm-delete-input")).toBeTruthy();
    const deleteInput = getByTestId("confirm-delete-input");
    expect(deleteInput.props.value).toBe("DELETE");

    expect(getByTestId("confirm-delete-input-label-delete")).toBeTruthy();
    expect(getByText("cancel")).toBeTruthy();
    expect(getByTestId("confirm-delete-btn")).toBeTruthy();
    const deleteButton = getByTestId("confirm-delete-btn");
    expect(
      deleteButton.findByProps({ children: "deleteAccount" }),
    ).toBeTruthy();

    fireEvent.press(deleteButton);
    expect(mockHandleConfirmationAccountDeletion).toHaveBeenCalledTimes(1);

    const cancelButton = getByText("cancel");
    fireEvent.press(cancelButton);
    expect(mockSetDeleteConfirmationDialogVisible).toHaveBeenCalledWith(false);
  });

  it("passes correct props to ErrorDialog", () => {
    const mockSetErrorDialogVisible = jest.fn();
    const errorMessage =
      "Failed to delete account. Please try again or contact support.";

    const { getByText } = render(
      <TestWrapper>
        <AccountSetting
          {...defaultProps}
          errorDialogVisible={true}
          setErrorDialogVisible={mockSetErrorDialogVisible}
          errorMessage={errorMessage}
        />
      </TestWrapper>,
    );

    expect(getByText("error")).toBeTruthy();
    expect(getByText(errorMessage)).toBeTruthy();
    const closeButton = getByText("ok");
    expect(closeButton).toBeTruthy();
    fireEvent.press(closeButton);
    expect(mockSetErrorDialogVisible).toHaveBeenCalledWith(false);
  });
});
