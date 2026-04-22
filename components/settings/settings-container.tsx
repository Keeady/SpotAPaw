import React, { useState, useEffect, useContext, useCallback } from "react";
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
import { SupportedLanguage } from "@/components/location-request-util";
import { onDeleteAccount } from "@/components/account/delete";
import { AuthContext } from "@/components/Provider/auth-provider";
import { useRouter } from "expo-router";
import { PermissionContext } from "../Provider/permission-provider";
import { useAIFeatureContext } from "../Provider/ai-context-provider";
import { createErrorLogMessage } from "../util";
import { log } from "../logs";
import SettingsRenderer from "./settings-renderer";
import * as Application from "expo-application";
import AboutSection from "./about-section";
import LocationPermissionSetting from "./location-permission-setting";
import CurrentLocationSetting from "./current-location-setting";
import LocationResetSetting from "./location-reset-setting";
import NotificationSetting from "./notification-setting";
import AISetting from "./ai-setting";
import LanguageSetting from "./language-setting";
import DistanceSetting from "./distance-setting";
import PrivacySetting from "./privacy-setting";
import TermsSetting from "./terms-setting";
import AccountSetting from "./account-setting";

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
  information: "#009688", // Teal
};

// Available languages
const languages: SupportedLanguage[] = [
  { code: "en", name: "English", nativeName: "English" },
];

const defaultDistance = "25";

const SettingsContainer = () => {
  const router = useRouter();

  // Location states
  const [locationPermission, setLocationPermission] = useState<boolean>(false);
  const [savedLocation, setSavedLocation] = useState<
    SightingLocation | undefined
  >();
  const [locationLoading, setLocationLoading] = useState(true);

  // Future features states (placeholders)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [selectedDistance, setSelectedDistance] = useState("25");

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

  const { getSavedLocation } = useContext(PermissionContext);

  const { isAiFeatureEnabled, saveAIFeatureContext } = useAIFeatureContext();

  const loadSavedLocation = useCallback(async () => {
    try {
      setLocationLoading(true);

      const savedLocationData = await getSavedLocation?.();
      if (savedLocationData) {
        setSavedLocation(savedLocationData);
      }
    } catch (error) {
      log(`Error loading saved location: ${createErrorLogMessage(error)}`);
    } finally {
      setLocationLoading(false);
    }
  }, [getSavedLocation]);

  useEffect(() => {
    loadSavedLocation();
  }, [loadSavedLocation]);

  useEffect(() => {
    // Load AI settings
    setAIFeatureEnabled(!!isAiFeatureEnabled);
  }, [isAiFeatureEnabled]);

  const loadSettings = useCallback(async () => {
    try {
      // Check location permission
      const { status } = await Location.getForegroundPermissionsAsync();
      setLocationPermission(status === "granted");

      const language = await AsyncStorage.getItem(PREFERRED_LANGUAGE);
      setSelectedLanguage(language || "en");

      // Load notification settings
      const notifications = await AsyncStorage.getItem(
        SIGHTING_NOTIFICATION_ENABLED_KEY,
      );
      setNotificationsEnabled(notifications === "true");

      const distance = await AsyncStorage.getItem(SIGHTING_DISTANCE_KEY);
      setSelectedDistance(distance || "25");
    } catch {
      log("Error loading settings");
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

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
    if (isNaN(Number(value)) || Number(value) < 0) {
      setErrorMessage("Invalid number for distance");
      setErrorDialogVisible(true);
      return;
    }

    setSelectedDistance(value);
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
    } catch (error) {
      const errorMessage = createErrorLogMessage(error);
      log(`onDeleteAccount: Failed to delete account: ${errorMessage}`);
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

  const handleAboutPress = () => {
    router.push("/about");
  };

  const versionText = Application.nativeApplicationVersion ?? "1.2.0";

  return (
    <SettingsRenderer
      aboutSection={
        <AboutSection
          onPress={handleAboutPress}
          iconColorInformation={iconColors.information}
        />
      }
      locationPermissionSetting={
        <LocationPermissionSetting
          iconColorLocation={iconColors.location}
          locationPermissionDescription={
            locationPermission ? "Enabled" : "Disabled"
          }
          handleRequestLocationPermission={handleRequestLocationPermission}
          locationPermissionButtonDisabled={locationPermission}
          locationPermissionStatusDisplayText={
            locationPermission ? "Granted" : "Request"
          }
          permissionGrantedDialogVisible={permissionGrantedDialogVisible}
          setPermissionGrantedDialogVisible={setPermissionGrantedDialogVisible}
          permissionDeniedDialogVisible={permissionDeniedDialogVisible}
          setPermissionDeniedDialogVisible={setPermissionDeniedDialogVisible}
        />
      }
      currentLocationSetting={
        <CurrentLocationSetting
          iconColorLocationCheck={iconColors.locationCheck}
          locationUsedDisplayText={
            locationLoading ? "Loading..." : getLocationDisplayText()
          }
        />
      }
      locationResetSetting={
        !locationPermission && !!savedLocation ? (
          <LocationResetSetting
            iconColorLocationRemove={iconColors.locationRemove}
            setResetLocationDialogVisible={setResetLocationDialogVisible}
            resetLocationDialogVisible={resetLocationDialogVisible}
            locationResetSuccessDialogVisible={
              locationResetSuccessDialogVisible
            }
            setLocationResetSuccessDialogVisible={
              setLocationResetSuccessDialogVisible
            }
            handleResetSavedLocation={handleResetSavedLocation}
          />
        ) : null
      }
      notificationSetting={
        <NotificationSetting
          iconColorNotification={iconColors.notification}
          notificationsEnabled={notificationsEnabled}
          onNotificationPress={handleToggleNotifications}
        />
      }
      aiSetting={
        <AISetting
          iconColorAI={iconColors.notification}
          aiFeatureEnabled={aiFeatureEnabled}
          onToggleAIFeature={handleToggleAIFeature}
        />
      }
      languageSetting={
        <LanguageSetting
          iconColorLanguage={iconColors.language}
          languageSelectedDescription={getSelectedLanguageDisplay()}
          onLanguagePress={setLanguageDialogVisible}
          languageDialogVisible={languageDialogVisible}
          handleLanguageChange={handleLanguageChange}
          selectedLanguage={selectedLanguage}
          languages={languages}
        />
      }
      distanceSetting={
        <DistanceSetting
          iconColorDistance={iconColors.distance}
          selectedDistance={selectedDistance}
          onDistancePress={setDistanceDialogVisible}
          distanceDialogVisible={distanceDialogVisible}
          handleDistanceChange={handleDistanceChange}
          defaultDistance={defaultDistance}
        />
      }
      privacySetting={
        <PrivacySetting
          iconColorPrivacy={iconColors.privacy}
          onOpenPrivacyPolicy={handleOpenPrivacyPolicy}
        />
      }
      termsSetting={
        <TermsSetting
          iconColorTerms={iconColors.terms}
          onOpenTermsOfService={handleOpenTermsOfService}
        />
      }
      accountSetting={
        !!user && (
          <AccountSetting
            iconColorDelete={iconColors.delete}
            onAccountDeletionPress={handleRequestAccountDeletion}
            deleteDialogVisible={deleteDialogVisible}
            setDeleteDialogVisible={setDeleteDialogVisible}
            handleAccountDeletionConfirmation={handleProceedToConfirmDeletion}
            deleteConfirmationDialogVisible={deleteConfirmDialogVisible}
            setDeleteConfirmationDialogVisible={setDeleteConfirmDialogVisible}
            handleConfirmationAccountDeletion={handleConfirmAccountDeletion}
            deletingAccount={deletingAccount}
            deleteConfirmationText={deleteConfirmText}
            setDeleteConfirmationText={setDeleteConfirmText}
            errorDialogVisible={errorDialogVisible}
            setErrorDialogVisible={setErrorDialogVisible}
            errorMessage={errorMessage}
          />
        )
      }
      versionText={versionText}
    />
  );
};

export default SettingsContainer;
