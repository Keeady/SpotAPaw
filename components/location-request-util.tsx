import { Button, Dialog, Portal, RadioButton, Text, TextInput } from "react-native-paper";
import { Linking, View, StyleSheet, ScrollView } from "react-native";

type LocationPermissionDeniedDialogProps = {
  permissionDeniedDialogVisible: boolean;
  setPermissionDeniedDialogVisible: (status: boolean) => void;
};

export const LocationPermissionDeniedDialog = ({
  permissionDeniedDialogVisible,
  setPermissionDeniedDialogVisible,
}: LocationPermissionDeniedDialogProps) => {
  return (
    <Portal>
      <Dialog
        visible={permissionDeniedDialogVisible}
        onDismiss={() => setPermissionDeniedDialogVisible(false)}
      >
        <Dialog.Title>Grant Location Permission</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">
            Location permission is required for the best experience. You can
            enable it in your device settings.
          </Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setPermissionDeniedDialogVisible(false)}>
            Cancel
          </Button>
          <Button
            onPress={() => {
              setPermissionDeniedDialogVisible(false);
              Linking.openSettings();
            }}
          >
            Open Settings
          </Button>
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
  return (
    <Portal>
      <Dialog
        visible={permissionGrantedDialogVisible}
        onDismiss={() => setPermissionGrantedDialogVisible(false)}
      >
        <Dialog.Title>Permission Granted</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">
            Location permission has been enabled. The app will now use your
            device location.
          </Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setPermissionGrantedDialogVisible(false)}>
            OK
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
  return (
    <Portal>
      <Dialog
        visible={resetLocationDialogVisible}
        onDismiss={() => setResetLocationDialogVisible(false)}
      >
        <Dialog.Title>Reset Saved Location?</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">
            This will remove your manually selected location. You will need to
            select a new location from the map or grant location permission.
          </Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setResetLocationDialogVisible(false)}>
            Cancel
          </Button>
          <Button onPress={handleResetSavedLocation}>Reset</Button>
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
  return (
    <Portal>
      <Dialog
        visible={locationResetSuccessDialogVisible}
        onDismiss={() => setLocationResetSuccessDialogVisible(false)}
      >
        <Dialog.Title>Location Reset</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">
            Your saved location has been removed. You can select a new location
            from the map.
          </Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setLocationResetSuccessDialogVisible(false)}>
            OK
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
  return (
    <Portal>
      <Dialog
        visible={errorDialogVisible}
        onDismiss={() => setErrorDialogVisible(false)}
      >
        <Dialog.Title>Error</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">{errorMessage}</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setErrorDialogVisible(false)}>OK</Button>
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
  return (
    <Portal>
      <Dialog
        visible={distanceDialogVisible}
        onDismiss={() => setDistanceDialogVisible(false)}
      >
        <Dialog.Title>Pet Sighting Distance</Dialog.Title>
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
            Cancel
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
}

type LanguageSelectionDialogProps = {
  languageDialogVisible: boolean;
  setLanguageDialogVisible: (status: boolean) => void;
  handleLanguageChange: (value: string) => Promise<void>;
  selectedLanguage: string;
  languages: SupportedLanguage[]
};

export const LanguageSelectionDialog = ({
  languageDialogVisible,
  setLanguageDialogVisible,
  handleLanguageChange,
  selectedLanguage,
  languages
}: LanguageSelectionDialogProps) => {
  return (
    <Portal>
        <Dialog
          visible={languageDialogVisible}
          onDismiss={() => setLanguageDialogVisible(false)}
        >
          <Dialog.Title>Select Language</Dialog.Title>
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
              Cancel
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
  );
};

{
  /* Account Deletion Warning Dialog */
}
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
  return (
    <Portal>
      <Dialog
        visible={deleteDialogVisible}
        onDismiss={() => setDeleteDialogVisible(false)}
      >
        <Dialog.Icon icon="alert" color="#d32f2f" size={48} />
        <Dialog.Title style={styles.dialogDangerTitle}>
          Delete Account?
        </Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium" style={styles.dialogText}>
            This action cannot be undone. Deleting your account will:
          </Text>
          <View style={styles.warningList}>
            <Text variant="bodyMedium" style={styles.warningItem}>
              • Permanently delete all your data
            </Text>
            <Text variant="bodyMedium" style={styles.warningItem}>
              • Permanently delete all your pet data
            </Text>
            <Text variant="bodyMedium" style={styles.warningItem}>
              • Remove your saved locations and preferences
            </Text>
            <Text variant="bodyMedium" style={styles.warningItem}>
              • Sign you out of all devices
            </Text>
          </View>
          <Text
            variant="bodyMedium"
            style={[styles.dialogText, styles.warningNote]}
          >
            Are you sure you want to continue?
          </Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setDeleteDialogVisible(false)}>Cancel</Button>
          <Button textColor="#d32f2f" onPress={handleProceedToConfirmDeletion}>
            Continue
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

{
  /* Account Deletion Confirmation Dialog */
}
type AccountDeletionConfirmationDialogProps = {
  deleteConfirmDialogVisible: boolean;
  setDeleteConfirmDialogVisible: (status: boolean) => void;
  handleConfirmAccountDeletion: () => void;
  deletingAccount: boolean,
  deleteConfirmText: string,
  setDeleteConfirmText: (value: string) => void
};

export const AccountDeletionConfirmationDialog = ({
  deleteConfirmDialogVisible,
  deletingAccount,
  setDeleteConfirmDialogVisible,
  deleteConfirmText,
  setDeleteConfirmText,
  handleConfirmAccountDeletion,
}: AccountDeletionConfirmationDialogProps) => {
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
          Confirm Account Deletion
        </Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium" style={styles.dialogText}>
            Type <Text style={styles.boldText}>DELETE</Text> to permanently
            delete your account:
          </Text>
          <TextInput
            mode="outlined"
            placeholder="Type DELETE"
            value={deleteConfirmText}
            onChangeText={setDeleteConfirmText}
            disabled={deletingAccount}
            autoCapitalize="characters"
            style={styles.confirmInput}
          />
        </Dialog.Content>
        <Dialog.Actions>
          <Button
            onPress={() => setDeleteConfirmDialogVisible(false)}
            disabled={deletingAccount}
          >
            Cancel
          </Button>
          <Button
            textColor="#d32f2f"
            onPress={handleConfirmAccountDeletion}
            loading={deletingAccount}
            disabled={
              deletingAccount || deleteConfirmText.trim().toLowerCase() !== "delete"
            }
          >
            Delete Account
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};


const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
  warningList: {
    marginVertical: 16,
    paddingLeft: 8,
  },
  warningItem: {
    marginBottom: 8,
    color: '#666',
  },
  warningNote: {
    marginTop: 16,
    fontWeight: '600',
  },
  dialogText: {
    marginBottom: 12,
  },
    dangerText: {
    color: '#d32f2f',
  },
  dialogDangerTitle: {
    color: '#d32f2f',
    textAlign: 'center',
  },
    boldText: {
    fontWeight: 'bold',
    color: '#d32f2f',
  },
  confirmInput: {
    marginTop: 16,
  },
})