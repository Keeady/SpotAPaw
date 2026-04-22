import { List } from "react-native-paper";
import {
  AccountDeletionConfirmationDialog,
  AccountDeletionWarningDialog,
  ErrorDialog,
} from "../location-request-util";

const AccountSetting = ({
  iconColorDelete,
  onAccountDeletionPress,
  deleteDialogVisible,
  setDeleteDialogVisible,
  handleAccountDeletionConfirmation,
  deleteConfirmationDialogVisible,
  setDeleteConfirmationDialogVisible,
  handleConfirmationAccountDeletion,
  deletingAccount,
  deleteConfirmationText,
  setDeleteConfirmationText,
  errorDialogVisible,
  setErrorDialogVisible,
  errorMessage,
}: {
  iconColorDelete: string;
  onAccountDeletionPress: () => void;
  deleteDialogVisible: boolean;
  setDeleteDialogVisible: (visible: boolean) => void;
  handleAccountDeletionConfirmation: () => void;

  deleteConfirmationDialogVisible: boolean;
  setDeleteConfirmationDialogVisible: (visible: boolean) => void;
  handleConfirmationAccountDeletion: () => void;
  deletingAccount: boolean;
  deleteConfirmationText: string;
  setDeleteConfirmationText: (text: string) => void;

  errorDialogVisible: boolean;
  setErrorDialogVisible: (visible: boolean) => void;
  errorMessage: string;
}) => {
  return (
    <>
      <List.Section>
        <List.Subheader>Account Management</List.Subheader>
        <List.Item
          title="Delete Account"
          description="Permanently delete your account and data"
          left={(props) => (
            <List.Icon
              {...props}
              icon="account-remove"
              color={iconColorDelete}
            />
          )}
          onPress={onAccountDeletionPress}
        />
      </List.Section>

      <AccountDeletionWarningDialog
        deleteDialogVisible={deleteDialogVisible}
        setDeleteDialogVisible={setDeleteDialogVisible}
        handleProceedToConfirmDeletion={handleAccountDeletionConfirmation}
      />

      <AccountDeletionConfirmationDialog
        deleteConfirmDialogVisible={deleteConfirmationDialogVisible}
        setDeleteConfirmDialogVisible={setDeleteConfirmationDialogVisible}
        handleConfirmAccountDeletion={handleConfirmationAccountDeletion}
        deletingAccount={deletingAccount}
        deleteConfirmText={deleteConfirmationText}
        setDeleteConfirmText={setDeleteConfirmationText}
      />

      <ErrorDialog
        errorDialogVisible={errorDialogVisible}
        setErrorDialogVisible={setErrorDialogVisible}
        errorMessage={errorMessage}
      />
    </>
  );
};

export default AccountSetting;
