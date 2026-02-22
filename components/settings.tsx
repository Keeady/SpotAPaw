import React, { useState, useEffect, useContext, useCallback } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { List, Switch, Button, Divider, Text } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import {
  getCurrentUserLocationV3,
  SightingLocation,
} from "@/components/get-current-location";
import {
  PREFERRED_LANGUAGE,
  SIGHTING_DISTANCE_KEY,
  SIGHTING_LOCATION_KEY,
  SIGHTING_NOTIFICATION_ENABLED_KEY,
} from "@/components/constants";
import {
  AccountDeletionConfirmationDialog,
  AccountDeletionWarningDialog,
  DistanceSelectionDialog,
  ErrorDialog,
  LanguageSelectionDialog,
  LocationConfirmationDialog,
  LocationPermissionDeniedDialog,
  LocationPermissionGrantedDialog,
  LocationResetSuccessDialog,
  SupportedLanguage,
} from "@/components/location-request-util";
import { onDeleteAccount } from "@/components/account/delete";
import { AuthContext } from "@/components/Provider/auth-provider";
import { useRouter } from "expo-router";
import { PermissionContext } from "./Provider/permission-provider";
import { useAIFeatureContext } from "./Provider/ai-context-provider";

const SettingsScreen = () => {
  // Define color scheme for icons
  const iconColors = {
    location: "#4CAF50", // Green
    locationCheck: "#2196F3", // Blue
    locationRemove: "#FF9800", // Orange
    notification: "#9C27B0", // Purple
    language: "#FF5722", // Deep Orange
    distance: "#00BCD4", // Cyan
    star: "#FFC107", // Amber/Gold
    privacy: "#3F51B5", // Indigo
    terms: "#607D8B", // Blue Grey
    delete: "#d32f2f", // Red
  };

  // Available languages
  const languages: SupportedLanguage[] = [
    { code: "en", name: "English", nativeName: "English" },
  ];

  const router = useRouter();

  // Location states
  const [locationPermission, setLocationPermission] = useState<boolean>(false);
  const [savedLocation, setSavedLocation] = useState<
    SightingLocation | undefined
  >();
  const [locationLoading, setLocationLoading] = useState(true);

  // Future features states (placeholders)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [defaultDistance, setDefaultDistance] = useState("5");

  // languages
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [languageDialogVisible, setLanguageDialogVisible] = useState(false);

  // AI
  const [aiFeatureEnabled, setAIFeatureEnabled] = useState(true);

  // Dialog states
  const [distanceDialogVisible, setDistanceDialogVisible] = useState(false);
  const [resetLocationDialogVisible, setResetLocationDialogVisible] =
    useState(false);
  const [permissionGrantedDialogVisible, setPermissionGrantedDialogVisible] =
    useState(false);
  const [permissionDeniedDialogVisible, setPermissionDeniedDialogVisible] =
    useState(false);
  const [
    locationResetSuccessDialogVisible,
    setLocationResetSuccessDialogVisible,
  ] = useState(false);
  const [errorDialogVisible, setErrorDialogVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Account deletion states
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [deleteConfirmDialogVisible, setDeleteConfirmDialogVisible] =
    useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);

  const { user } = useContext(AuthContext);

  const { getSavedLocation, enabledLocationPermission } =
    useContext(PermissionContext);

  const { isAiFeatureEnabled, saveAIFeatureContext } = useAIFeatureContext();

  const loadSettings = useCallback(async () => {
    try {
      setLocationLoading(true);

      // Check location permission
      const { status } = await Location.getForegroundPermissionsAsync();
      setLocationPermission(status === "granted");

      // Load saved location
      const savedLocationData = await getSavedLocation?.();
      if (savedLocationData) {
        setSavedLocation(savedLocationData);
      }

      const language = await AsyncStorage.getItem(PREFERRED_LANGUAGE);
      setSelectedLanguage(language || "en");

      // Load notification settings
      const notifications = await AsyncStorage.getItem(
        SIGHTING_NOTIFICATION_ENABLED_KEY,
      );
      setNotificationsEnabled(notifications === "true");

      // Load AI settings
      // const aiFeature = await AsyncStorage.getItem(SIGHTING_AI_ENABLED_KEY);
      setAIFeatureEnabled(!!isAiFeatureEnabled);

      const distance = await AsyncStorage.getItem(SIGHTING_DISTANCE_KEY);
      setDefaultDistance(distance || "5");
    } catch {
    } finally {
      setLocationLoading(false);
    }
  }, [getSavedLocation, isAiFeatureEnabled]);

  useEffect(() => {
    loadSettings();
  }, [enabledLocationPermission, loadSettings]);

  const handleRequestLocationPermission = async () => {
    getCurrentUserLocationV3()
      .then((location) => {
        if (location) {
          setLocationPermission(true);
          setPermissionGrantedDialogVisible(true);
        } else {
          setLocationPermission(false);
          setPermissionDeniedDialogVisible(true);
        }
      })
      .catch(() => {
        setLocationPermission(false);
        setPermissionDeniedDialogVisible(true);
      });
  };

  const handleResetSavedLocation = async () => {
    try {
      await AsyncStorage.removeItem(SIGHTING_LOCATION_KEY);
      setSavedLocation(undefined);
      setResetLocationDialogVisible(false);
      setLocationResetSuccessDialogVisible(true);
    } catch {
      setErrorMessage("Failed to reset saved location");
    }
  };

  const handleToggleNotifications = async (value: boolean) => {
    setNotificationsEnabled(value);
    await AsyncStorage.setItem(
      SIGHTING_NOTIFICATION_ENABLED_KEY,
      value.toString(),
    );
  };

  const handleToggleAIFeature = async (value: boolean) => {
    setAIFeatureEnabled(value);
    saveAIFeatureContext?.(value);
  };

  const handleDistanceChange = async (value: string) => {
    setDefaultDistance(value);
    await AsyncStorage.setItem(SIGHTING_DISTANCE_KEY, value);
    setDistanceDialogVisible(false);
  };

  const handleLanguageChange = async (selectedLanguageCode: string) => {
    setSelectedLanguage(selectedLanguageCode);
    await AsyncStorage.setItem(PREFERRED_LANGUAGE, selectedLanguageCode);
    setLanguageDialogVisible(false);
  };

  const getSelectedLanguageDisplay = () => {
    const language = languages.find((lang) => lang.code === selectedLanguage);
    return language ? `${language.name} (${language.nativeName})` : "English";
  };

  const getLocationDisplayText = () => {
    if (locationPermission) {
      return "Using device location";
    } else if (savedLocation) {
      return `Saved: ${savedLocation.locationAddress || `${savedLocation.lat?.toFixed(6)}, ${savedLocation.lng?.toFixed(6)}`}`;
    } else {
      return "No location set";
    }
  };

  const handleRequestAccountDeletion = () => {
    setDeleteDialogVisible(true);
  };

  const handleProceedToConfirmDeletion = () => {
    setDeleteDialogVisible(false);
    setDeleteConfirmDialogVisible(true);
    setDeleteConfirmText("");
  };

  const handleConfirmAccountDeletion = async () => {
    if (deleteConfirmText.trim().toLowerCase() !== "delete") {
      setErrorMessage("Please type DELETE to confirm");
      setErrorDialogVisible(true);
      return;
    }

    setDeletingAccount(true);

    try {
      if (user?.id) {
        setDeleteConfirmDialogVisible(false);
        setDeletingAccount(false);
        // Clear all local data
        await AsyncStorage.clear();
        await onDeleteAccount(user.id);
      }
    } catch {
      setErrorMessage(
        "Failed to delete account. Please try again or contact support.",
      );
      setErrorDialogVisible(true);
      setDeletingAccount(false);
    }
  };

  const handleOpenPrivacyPolicy = () => {
    router.push("/privacy");
  };

  const handleOpenTermsOfService = () => {
    router.push("/terms");
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Location Settings Section */}
        <List.Section>
          <List.Subheader>Location</List.Subheader>

          <List.Item
            title="Location Permission"
            description={locationPermission ? "Enabled" : "Disabled"}
            left={(props) => (
              <List.Icon
                {...props}
                icon="map-marker"
                color={iconColors.location}
              />
            )}
            right={() => (
              <Button
                mode="contained"
                compact
                onPress={handleRequestLocationPermission}
                disabled={locationPermission}
              >
                {locationPermission ? "Granted" : "Request"}
              </Button>
            )}
          />

          <Divider />

          <List.Item
            title="Current Location"
            description={
              locationLoading ? "Loading..." : getLocationDisplayText()
            }
            left={(props) => (
              <List.Icon
                {...props}
                icon="map-marker-check"
                color={iconColors.locationCheck}
              />
            )}
          />

          {!locationPermission && savedLocation && (
            <>
              <Divider />
              <List.Item
                title="Reset Saved Location"
                description="Remove your manually selected location"
                left={(props) => (
                  <List.Icon
                    {...props}
                    icon="map-marker-remove"
                    color={iconColors.locationRemove}
                  />
                )}
                right={() => (
                  <Button
                    mode="outlined"
                    compact
                    onPress={() => setResetLocationDialogVisible(true)}
                  >
                    Reset
                  </Button>
                )}
              />
            </>
          )}
        </List.Section>

        <Divider />

        {/* Notifications Section (Future Feature) */}
        <List.Section>
          <List.Subheader>Notifications</List.Subheader>

          <List.Item
            title="Push Notifications"
            description="Get notified about updates and events"
            left={(props) => (
              <List.Icon
                {...props}
                icon="bell"
                color={iconColors.notification}
              />
            )}
            right={() => (
              <Switch
                value={notificationsEnabled}
                onValueChange={handleToggleNotifications}
              />
            )}
          />
        </List.Section>

        <Divider />

        {/* Preferences Section (Future Feature) */}
        <List.Section>
          <List.Subheader>Preferences</List.Subheader>

          <List.Item
            title="AI Image Analysis"
            description="Enable image analysis for pet identification"
            left={(props) => (
              <List.Icon
                {...props}
                icon="creation-outline"
                color={iconColors.notification}
              />
            )}
            right={() => (
              <Switch
                value={aiFeatureEnabled}
                onValueChange={handleToggleAIFeature}
              />
            )}
          />

          <List.Item
            title="Language"
            description={getSelectedLanguageDisplay()}
            left={(props) => (
              <List.Icon
                {...props}
                icon="translate"
                color={iconColors.language}
              />
            )}
            onPress={() => setLanguageDialogVisible(true)}
          />

          <List.Item
            title="Default Distance"
            description={`${defaultDistance} km radius`}
            left={(props) => (
              <List.Icon
                {...props}
                icon="map-marker-distance"
                color={iconColors.distance}
              />
            )}
            onPress={() => setDistanceDialogVisible(true)}
          />
        </List.Section>

        <Divider />
        {/* Legal Section */}
        <List.Section>
          <List.Subheader>Legal</List.Subheader>

          <List.Item
            title="Privacy Policy"
            description="Learn how we handle your data"
            left={(props) => (
              <List.Icon
                {...props}
                icon="shield-account"
                color={iconColors.privacy}
              />
            )}
            onPress={handleOpenPrivacyPolicy}
          />

          <Divider />

          <List.Item
            title="Terms of Service"
            description="Read our terms and conditions"
            left={(props) => (
              <List.Icon
                {...props}
                icon="file-document"
                color={iconColors.terms}
              />
            )}
            onPress={handleOpenTermsOfService}
          />
        </List.Section>

        {user && (
          <>
            <Divider />

            <List.Section>
              <List.Subheader>Account Management</List.Subheader>
              <List.Item
                title="Delete Account"
                description="Permanently delete your account and data"
                left={(props) => (
                  <List.Icon
                    {...props}
                    icon="account-remove"
                    color={iconColors.delete}
                  />
                )}
                onPress={handleRequestAccountDeletion}
              />
            </List.Section>
          </>
        )}

        <Divider />

        <View style={styles.footer}>
          <Text variant="bodySmall" style={styles.footerText}>
            Version 1.0.0
          </Text>
          <Text variant="bodySmall">
            SpotAPaw &#169; {new Date().getFullYear()}
          </Text>
        </View>
      </ScrollView>

      {/* Permission Granted Dialog */}
      <LocationPermissionGrantedDialog
        permissionGrantedDialogVisible={permissionGrantedDialogVisible}
        setPermissionGrantedDialogVisible={setPermissionGrantedDialogVisible}
      />

      {/* Permission Denied Dialog */}
      <LocationPermissionDeniedDialog
        permissionDeniedDialogVisible={permissionDeniedDialogVisible}
        setPermissionDeniedDialogVisible={setPermissionDeniedDialogVisible}
      />

      {/* Error Dialog */}
      <ErrorDialog
        errorDialogVisible={errorDialogVisible}
        setErrorDialogVisible={setErrorDialogVisible}
        errorMessage={errorMessage}
      />

      {/* Reset Location Confirmation Dialog */}
      <LocationConfirmationDialog
        resetLocationDialogVisible={resetLocationDialogVisible}
        setResetLocationDialogVisible={setResetLocationDialogVisible}
        handleResetSavedLocation={handleResetSavedLocation}
      />

      {/* Location Reset Success Dialog */}
      <LocationResetSuccessDialog
        locationResetSuccessDialogVisible={locationResetSuccessDialogVisible}
        setLocationResetSuccessDialogVisible={
          setLocationResetSuccessDialogVisible
        }
      />

      {/* Distance Selection Dialog */}
      <DistanceSelectionDialog
        distanceDialogVisible={distanceDialogVisible}
        setDistanceDialogVisible={setDistanceDialogVisible}
        handleDistanceChange={handleDistanceChange}
        defaultDistance={defaultDistance}
      />

      <LanguageSelectionDialog
        languageDialogVisible={languageDialogVisible}
        setLanguageDialogVisible={setLanguageDialogVisible}
        handleLanguageChange={handleLanguageChange}
        selectedLanguage={selectedLanguage}
        languages={languages}
      />

      <AccountDeletionWarningDialog
        deleteDialogVisible={deleteDialogVisible}
        setDeleteDialogVisible={setDeleteDialogVisible}
        handleProceedToConfirmDeletion={handleProceedToConfirmDeletion}
      />

      <AccountDeletionConfirmationDialog
        deleteConfirmDialogVisible={deleteConfirmDialogVisible}
        setDeleteConfirmDialogVisible={setDeleteConfirmDialogVisible}
        handleConfirmAccountDeletion={handleConfirmAccountDeletion}
        deletingAccount={deletingAccount}
        deleteConfirmText={deleteConfirmText}
        setDeleteConfirmText={setDeleteConfirmText}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  footer: {
    padding: 20,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  footerText: {
    color: "#666",
  },
});

export default SettingsScreen;
