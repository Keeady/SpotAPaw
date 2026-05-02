import {
  Button,
  Dialog,
  Portal,
  RadioButton,
  Text,
  TextInput,
} from "react-native-paper";
import { Linking, View, StyleSheet, ScrollView, Platform } from "react-native";
import { useTranslation } from "react-i18next";

type LocationPermissionDeniedDialogProps = {
  permissionDeniedDialogVisible: boolean;
  setPermissionDeniedDialogVisible: (status: boolean) => void;
};

export const LocationPermissionDeniedDialog = ({
  permissionDeniedDialogVisible,
  setPermissionDeniedDialogVisible,
}: LocationPermissionDeniedDialogProps) => {
  const { t } = useTranslation(["dialog"]);
  return (
    <Portal>
      <Dialog
        visible={permissionDeniedDialogVisible}
        onDismiss={() => setPermissionDeniedDialogVisible(false)}
      >
        <Dialog.Title>{t("grantLocationPermission")}</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">
            {Platform.OS === "web"
              ? t("turningOnLocationWeb")
              : t("turningOnLocationMobile")}
          </Text>
        </Dialog.Content>
        <Dialog.Actions>
          {Platform.OS === "web" ? (
            <Button onPress={() => setPermissionDeniedDialogVisible(false)}>
              {t("ok")}
            </Button>
          ) : (
            <View style={{ flexDirection: "row" }}>
              <Button onPress={() => setPermissionDeniedDialogVisible(false)}>
                {t("cancel")}
              </Button>
              <Button
                onPress={() => {
                  setPermissionDeniedDialogVisible(false);
                  Linking.openSettings();
                }}
              >
                {t("openSettings")}
              </Button>
            </View>
          )}
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

type LocationPermissionGrantedDialogProps = {
  permissionGrantedDialogVisible: boolean;
  setPermissionGrantedDialogVisible: (status: boolean) => void;
};

export const LocationPermissionGrantedDialog = ({
  permissionGrantedDialogVisible,
  setPermissionGrantedDialogVisible,
}: LocationPermissionGrantedDialogProps) => {
  const { t } = useTranslation(["dialog"]);
  return (
    <Portal>
      <Dialog
        visible={permissionGrantedDialogVisible}
        onDismiss={() => setPermissionGrantedDialogVisible(false)}
      >
        <Dialog.Title>{t("permissionGranted")}</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">{t("locationPermissionEnabled")}</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setPermissionGrantedDialogVisible(false)}>
            {t("ok")}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

type LocationConfirmationDialogProps = {
  resetLocationDialogVisible: boolean;
  setResetLocationDialogVisible: (status: boolean) => void;
  handleResetSavedLocation: () => void;
};

export const LocationConfirmationDialog = ({
  resetLocationDialogVisible,
  setResetLocationDialogVisible,
  handleResetSavedLocation,
}: LocationConfirmationDialogProps) => {
  const { t } = useTranslation(["dialog"]);
  return (
    <Portal>
      <Dialog
        visible={resetLocationDialogVisible}
        onDismiss={() => setResetLocationDialogVisible(false)}
      >
        <Dialog.Title>{t("resetSavedLocation")}</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">{t("resetSavedLocationMessage")}</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setResetLocationDialogVisible(false)}>
            {t("cancel")}
          </Button>
          <Button
            onPress={handleResetSavedLocation}
            testID="reset-confirm-button"
          >
            {t("reset")}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

type LocationResetSuccessDialogProps = {
  locationResetSuccessDialogVisible: boolean;
  setLocationResetSuccessDialogVisible: (status: boolean) => void;
};

export const LocationResetSuccessDialog = ({
  locationResetSuccessDialogVisible,
  setLocationResetSuccessDialogVisible,
}: LocationResetSuccessDialogProps) => {
  const { t } = useTranslation(["dialog"]);
  return (
    <Portal>
      <Dialog
        visible={locationResetSuccessDialogVisible}
        onDismiss={() => setLocationResetSuccessDialogVisible(false)}
      >
        <Dialog.Title>{t("locationReset")}</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">{t("locationResetMessage")}</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setLocationResetSuccessDialogVisible(false)}>
            {t("ok")}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

type ErrorDialogProps = {
  errorDialogVisible: boolean;
  setErrorDialogVisible: (status: boolean) => void;
  errorMessage: string;
};

export const ErrorDialog = ({
  errorDialogVisible,
  setErrorDialogVisible,
  errorMessage,
}: ErrorDialogProps) => {
  const { t } = useTranslation(["dialog"]);
  return (
    <Portal>
      <Dialog
        visible={errorDialogVisible}
        onDismiss={() => setErrorDialogVisible(false)}
      >
        <Dialog.Title>{t("error")}</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">{errorMessage}</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setErrorDialogVisible(false)}>
            {t("ok")}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

type DistanceSelectionDialogProps = {
  distanceDialogVisible: boolean;
  setDistanceDialogVisible: (status: boolean) => void;
  handleDistanceChange: (value: string) => Promise<void>;
  defaultDistance: string;
};

export const DistanceSelectionDialog = ({
  distanceDialogVisible,
  setDistanceDialogVisible,
  handleDistanceChange,
  defaultDistance,
}: DistanceSelectionDialogProps) => {
  const { t } = useTranslation(["dialog"]);
  return (
    <Portal>
      <Dialog
        visible={distanceDialogVisible}
        onDismiss={() => setDistanceDialogVisible(false)}
      >
        <Dialog.Title>{t("petSightingDistance")}</Dialog.Title>
        <Dialog.Content>
          <RadioButton.Group
            onValueChange={handleDistanceChange}
            value={defaultDistance}
          >
            <RadioButton.Item label="1 km" value="1" />
            <RadioButton.Item label="5 km" value="5" />
            <RadioButton.Item label="10 km" value="10" />
            <RadioButton.Item label="25 km" value="25" />
            <RadioButton.Item label="50 km" value="50" />
            <RadioButton.Item label="100 km" value="100" />
          </RadioButton.Group>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setDistanceDialogVisible(false)}>
            {t("cancel")}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

export type SupportedLanguage = {
  code: string;
  name: string;
  nativeName: string;
};

type LanguageSelectionDialogProps = {
  languageDialogVisible: boolean;
  setLanguageDialogVisible: (status: boolean) => void;
  handleLanguageChange: (value: string) => Promise<void>;
  selectedLanguage: string;
  languages: SupportedLanguage[];
};

export const LanguageSelectionDialog = ({
  languageDialogVisible,
  setLanguageDialogVisible,
  handleLanguageChange,
  selectedLanguage,
  languages,
}: LanguageSelectionDialogProps) => {
  const { t } = useTranslation(["dialog"]);
  return (
    <Portal>
      <Dialog
        visible={languageDialogVisible}
        onDismiss={() => setLanguageDialogVisible(false)}
      >
        <Dialog.Title>{t("selectLanguage")}</Dialog.Title>
        <Dialog.ScrollArea>
          <ScrollView>
            <RadioButton.Group
              onValueChange={handleLanguageChange}
              value={selectedLanguage}
            >
              {languages.map((language) => (
                <RadioButton.Item
                  key={language.code}
                  label={`${language.name} (${language.nativeName})`}
                  value={language.code}
                />
              ))}
            </RadioButton.Group>
          </ScrollView>
        </Dialog.ScrollArea>
        <Dialog.Actions>
          <Button onPress={() => setLanguageDialogVisible(false)}>
            {t("cancel")}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

type AccountDeletionWarningDialogProps = {
  deleteDialogVisible: boolean;
  setDeleteDialogVisible: (status: boolean) => void;
  handleProceedToConfirmDeletion: () => void;
};

export const AccountDeletionWarningDialog = ({
  deleteDialogVisible,
  setDeleteDialogVisible,
  handleProceedToConfirmDeletion,
}: AccountDeletionWarningDialogProps) => {
  const { t } = useTranslation(["dialog"]);
  return (
    <Portal>
      <Dialog
        visible={deleteDialogVisible}
        onDismiss={() => setDeleteDialogVisible(false)}
      >
        <Dialog.Icon icon="alert" color="#d32f2f" size={48} />
        <Dialog.Title style={styles.dialogDangerTitle}>
          {t("deleteAccountTitle")}
        </Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium" style={styles.dialogText}>
            {t("thisActionCannotBeUndone")}
          </Text>
          <View style={styles.warningList}>
            <Text variant="bodyMedium" style={styles.warningItem}>
              • {t("permanentlyDeleteAllYourData")}
            </Text>
            <Text variant="bodyMedium" style={styles.warningItem}>
              • {t("permanentlyDeleteAllYourPetData")}
            </Text>
            <Text variant="bodyMedium" style={styles.warningItem}>
              • {t("removeYourSavedLocationsAndPreferences")}
            </Text>
            <Text variant="bodyMedium" style={styles.warningItem}>
              • {t("signYouOutOfAllDevices")}
            </Text>
          </View>
          <Text
            variant="bodyMedium"
            style={[styles.dialogText, styles.warningNote]}
          >
            {t("areYouSureYouWantToContinue")}
          </Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setDeleteDialogVisible(false)}>
            {t("cancel")}
          </Button>
          <Button textColor="#d32f2f" onPress={handleProceedToConfirmDeletion}>
            {t("continue")}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

type AccountDeletionConfirmationDialogProps = {
  deleteConfirmDialogVisible: boolean;
  setDeleteConfirmDialogVisible: (status: boolean) => void;
  handleConfirmAccountDeletion: () => void;
  deletingAccount: boolean;
  deleteConfirmText: string;
  setDeleteConfirmText: (value: string) => void;
};

export const AccountDeletionConfirmationDialog = ({
  deleteConfirmDialogVisible,
  deletingAccount,
  setDeleteConfirmDialogVisible,
  deleteConfirmText,
  setDeleteConfirmText,
  handleConfirmAccountDeletion,
}: AccountDeletionConfirmationDialogProps) => {
  const { t } = useTranslation(["dialog", "settings"]);
  return (
    <Portal>
      <Dialog
        visible={deleteConfirmDialogVisible}
        onDismiss={() =>
          !deletingAccount && setDeleteConfirmDialogVisible(false)
        }
        dismissable={!deletingAccount}
      >
        <Dialog.Title style={styles.dialogDangerTitle}>
          {t("confirmAccountDeletion")}
        </Dialog.Title>
        <Dialog.Content>
          <Text
            variant="bodyMedium"
            style={styles.dialogText}
            testID="confirm-delete-input-label"
          >
            {t("typeDeleteToPermanentlyDeleteAccount")}
            <Text
              style={styles.boldText}
              testID="confirm-delete-input-label-delete"
            >
              {t("delete")}
            </Text>
            {t("toPermanentlyDeleteYourAccount")}
          </Text>
          <TextInput
            mode="outlined"
            placeholder={t("typeDelete")}
            value={deleteConfirmText}
            onChangeText={setDeleteConfirmText}
            disabled={deletingAccount}
            autoCapitalize="characters"
            style={styles.confirmInput}
            testID="confirm-delete-input"
          />
        </Dialog.Content>
        <Dialog.Actions>
          <Button
            onPress={() => setDeleteConfirmDialogVisible(false)}
            disabled={deletingAccount}
          >
            {t("cancel")}
          </Button>
          <Button
            textColor="#d32f2f"
            onPress={handleConfirmAccountDeletion}
            loading={deletingAccount}
            disabled={
              deletingAccount ||
              deleteConfirmText.trim().toLowerCase() !==
                t("delete").toLowerCase()
            }
            testID="confirm-delete-btn"
          >
            {t("deleteAccount", { ns: "settings" })}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
  },
  warningList: {
    marginVertical: 16,
    paddingLeft: 8,
  },
  warningItem: {
    marginBottom: 8,
    color: "#666",
  },
  warningNote: {
    marginTop: 16,
    fontWeight: "600",
  },
  dialogText: {
    marginBottom: 12,
  },
  dangerText: {
    color: "#d32f2f",
  },
  dialogDangerTitle: {
    color: "#d32f2f",
    textAlign: "center",
  },
  boldText: {
    fontWeight: "bold",
    color: "#d32f2f",
  },
  confirmInput: {
    marginTop: 16,
  },
});
