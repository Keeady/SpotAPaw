import { List } from "react-native-paper";
import {
  AccountDeletionConfirmationDialog,
  AccountDeletionWarningDialog,
  ErrorDialog,
} from "../location-request-util";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation(["settings", "translation"]);
  return (
    <>
      <List.Section>
        <List.Subheader>{t("accountManagement")}</List.Subheader>
        <List.Item
          title={t("deleteAccount")}
          description={t("permanentlyDeleteYourAccountAndData")}
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
