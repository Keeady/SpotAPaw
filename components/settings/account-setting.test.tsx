import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import { Provider as PaperProvider } from "react-native-paper";
import AccountSetting from "./account-setting";
import { Text } from "react-native";

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

    expect(getByText("Account Management")).toBeTruthy();
    expect(getByText("Delete Account")).toBeTruthy();
    expect(getByText("Permanently delete your account and data")).toBeTruthy();
    expect(getByText("Icon")).toBeTruthy();
  });

  it("calls onAccountDeletionPress when delete account item is pressed", () => {
    const { getByText } = render(
      <TestWrapper>
        <AccountSetting {...defaultProps} />
      </TestWrapper>,
    );

    expect(getByText("Delete Account")).toBeTruthy();
    const deleteAccountItem = getByText("Delete Account");
    fireEvent.press(deleteAccountItem);

    expect(defaultProps.onAccountDeletionPress).toHaveBeenCalledTimes(1);
  });

  it("passes correct props to AccountDeletionWarningDialog", () => {
    const mockSetDeleteDialogVisible = jest.fn();
    const mockHandleAccountDeletionConfirmation = jest.fn();

    const { getByText } = render(
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

    expect(getByText("Delete Account")).toBeTruthy();
    expect(
      getByText("This action cannot be undone. Deleting your account will:"),
    ).toBeTruthy();
    expect(getByText("• Permanently delete all your data")).toBeTruthy();
    expect(getByText("• Permanently delete all your pet data")).toBeTruthy();
    expect(
      getByText("• Remove your saved locations and preferences"),
    ).toBeTruthy();
    expect(getByText("• Sign you out of all devices")).toBeTruthy();
    expect(getByText("Are you sure you want to continue?")).toBeTruthy();
    expect(getByText("Cancel")).toBeTruthy();
    expect(getByText("Continue")).toBeTruthy();

    const cancelButton = getByText("Cancel");
    const continueButton = getByText("Continue");

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

    expect(getByText("Confirm Account Deletion")).toBeTruthy();
    expect(
      getByText("Type DELETE to permanently delete your account:"),
    ).toBeTruthy();
    expect(getByTestId("confirm-delete-input")).toBeTruthy();
    const deleteInput = getByTestId("confirm-delete-input");
    expect(deleteInput.props.value).toBe("");

    expect(getByPlaceholderText("Type DELETE")).toBeTruthy();
    expect(getByText("Cancel")).toBeTruthy();
    expect(getByTestId("confirm-delete-btn")).toBeTruthy();
    const deleteButton = getByTestId("confirm-delete-btn");
    expect(
      deleteButton.findByProps({ children: "Delete Account" }),
    ).toBeTruthy();

    fireEvent.changeText(deleteInput, "DELETE");
    expect(mockSetDeleteConfirmationText).toHaveBeenCalledWith("DELETE");

    fireEvent.press(deleteButton);
    expect(mockHandleConfirmationAccountDeletion).not.toHaveBeenCalled();

    const cancelButton = getByText("Cancel");
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

    expect(getByText("Confirm Account Deletion")).toBeTruthy();
    expect(
      getByText("Type DELETE to permanently delete your account:"),
    ).toBeTruthy();
    expect(getByTestId("confirm-delete-input")).toBeTruthy();
    const deleteInput = getByTestId("confirm-delete-input");
    expect(deleteInput.props.value).toBe("DELETE");

    expect(getByPlaceholderText("Type DELETE")).toBeTruthy();
    expect(getByText("Cancel")).toBeTruthy();
    expect(getByTestId("confirm-delete-btn")).toBeTruthy();
    const deleteButton = getByTestId("confirm-delete-btn");
    expect(
      deleteButton.findByProps({ children: "Delete Account" }),
    ).toBeTruthy();

    fireEvent.press(deleteButton);
    expect(mockHandleConfirmationAccountDeletion).toHaveBeenCalledTimes(1);

    const cancelButton = getByText("Cancel");
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

    expect(getByText("Error")).toBeTruthy();
    expect(getByText(errorMessage)).toBeTruthy();
    const closeButton = getByText("OK");
    expect(closeButton).toBeTruthy();
    fireEvent.press(closeButton);
    expect(mockSetErrorDialogVisible).toHaveBeenCalledWith(false);
  });
});
