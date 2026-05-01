import { fireEvent, render } from "@testing-library/react-native";
import SettingsContainer from "./settings-container";
import { Provider as PaperProvider } from "react-native-paper";
import { Text } from "react-native";
import { AuthContext } from "../Provider/auth-provider";
import { PermissionContext } from "../Provider/permission-provider";
import { AIFeatureContext } from "../Provider/ai-context-provider";
import { LocaleContext } from "../Provider/locale-provider";

const fakeUser = { id: "test-user-id" };

const mockSetItem = jest.fn();
const mockGetItem = jest.fn();
jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: (key: string, value: string) => mockSetItem(key, value),
  getItem: (key: string) => mockGetItem(key),
}));

const mockOnDeleteAccount = jest.fn();
jest.mock("@/components/account/delete", () => ({
  onDeleteAccount: () => mockOnDeleteAccount(),
}));

const mockGetSavedLocation = jest.fn();

jest.mock("../Provider/permission-provider", () => {
  const React = require("react");
  const PermissionContext = React.createContext({
    enabledLocationPermission: true,
    getSavedLocation: mockGetSavedLocation,
  });

  return {
    PermissionContext,
  };
});

jest.mock("@/components/Provider/auth-provider", () => {
  const React = require("react");
  const fakeUser = { id: "test-user-id" };
  const AuthContext = React.createContext({ user: fakeUser });

  return {
    AuthContext,
  };
});

jest.mock("../Provider/ai-context-provider", () => {
  const React = require("react");
  const useAIFeatureContext = () => ({ isAiFeatureEnabled: true });
  const AIFeatureContext = React.createContext({ isAiFeatureEnabled: true });

  return {
    AIFeatureContext,
    useAIFeatureContext,
  };
});

let mockPreferredLanguage = "en";
jest.mock("../Provider/locale-provider", () => {
  const React = require("react");
  const useLocaleContext = () => ({
    preferredLanguage: mockPreferredLanguage,
    saveLanguageContext: jest.fn(),
  });
  const LocaleContext = React.createContext({
    preferredLanguage: mockPreferredLanguage,
    saveLanguageContext: jest.fn(),
  });

  return {
    LocaleContext,
    useLocaleContext,
  };
});

jest.mock("../util", () => ({
  isValidUuid: jest.fn(() => true),
  saveStorageItem: jest.fn(),
  getStorageItem: jest.fn(),
  createErrorLogMessage: jest.fn((error) => error.message || "Unknown error"),
}));

jest.mock("../logs", () => ({
  log: jest.fn(),
}));

jest.mock("expo-application", () => ({
  nativeApplicationVersion: "1.0.0",
}));

const mockRouterPush = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
}));

const mockGetCurrentUserLocationV3 = jest.fn();
jest.mock("@/components/get-current-location", () => ({
  getCurrentUserLocationV3: () => mockGetCurrentUserLocationV3(),
}));

const MockIcon = () => <Text testID="icon">Icon</Text>;
const TestWrapper = ({
  children,
  user,
}: {
  children: React.ReactNode;
  user: any;
}) => (
  <AuthContext.Provider value={{ user }}>
    <PermissionContext.Provider
      value={{
        enabledLocationPermission: true,
        getSavedLocation: mockGetSavedLocation,
      }}
    >
      <LocaleContext.Provider
        value={{
          preferredLanguage: mockPreferredLanguage,
          saveLanguageContext: jest.fn(),
        }}
      >
        <AIFeatureContext.Provider value={{ isAiFeatureEnabled: true }}>
          <PaperProvider settings={{ icon: MockIcon }}>
            {children}
          </PaperProvider>
        </AIFeatureContext.Provider>
      </LocaleContext.Provider>
    </PermissionContext.Provider>
  </AuthContext.Provider>
);

describe("SettingsContainer Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCurrentUserLocationV3.mockResolvedValue({
      latitude: 37.7749,
      longitude: -122.4194,
    });
  });

  it("renders correctly", async () => {
    const {
      getByText,
      findByText,
      queryByText,
      getByTestId,
      findAllByText,
      findByTestId,
    } = render(
      <TestWrapper user={fakeUser}>
        <SettingsContainer />
      </TestWrapper>,
    );
    expect(getByText("About")).toBeTruthy();
    expect(getByText("Learn more about the app")).toBeTruthy();

    expect(getByText("Location")).toBeTruthy();
    expect(getByText("Location Permission")).toBeTruthy();
    expect(getByText("Disabled")).toBeTruthy();
    expect(getByText("Request")).toBeTruthy();
    expect(getByText("Current Location")).toBeTruthy();
    expect(getByText("Loading...")).toBeTruthy();

    expect(getByText("Notifications")).toBeTruthy();
    expect(getByText("Push Notifications")).toBeTruthy();
    expect(getByText("Get notified about updates and events")).toBeTruthy();

    expect(getByText("Terms of Service")).toBeTruthy();
    expect(getByText("Read our terms and conditions")).toBeTruthy();

    expect(getByText("Privacy Policy")).toBeTruthy();
    expect(getByText("Learn how we handle your data")).toBeTruthy();

    expect(getByText("Language")).toBeTruthy();
    expect(getByText("English (English)")).toBeTruthy();

    expect(getByText("Default Distance")).toBeTruthy();
    expect(getByText("25 km radius")).toBeTruthy();

    expect(getByText("Delete Account")).toBeTruthy();
    expect(getByText("Permanently delete your account and data")).toBeTruthy();

    expect(getByText("Version 1.0.0")).toBeTruthy();

    expect(await findByText("No location set")).toBeTruthy();
    expect(queryByText("Loading...")).toBeNull();

    const aboutButton = getByText("About");
    fireEvent.press(aboutButton);
    expect(mockRouterPush).toHaveBeenCalledWith("/about");

    const requestLocationButton = getByText("Request");
    fireEvent.press(requestLocationButton);
    expect(mockGetCurrentUserLocationV3).toHaveBeenCalled();
    expect(await findByText("Current Location")).toBeTruthy();
    expect(await findByText("Granted")).toBeTruthy();

    const notificationSwitch = getByTestId("notification-switch");
    expect(notificationSwitch.props.value).toBe(false);
    fireEvent(notificationSwitch, "valueChange", true);
    expect(notificationSwitch.props.value).toBe(true);
    expect(mockSetItem).toHaveBeenCalledWith("notificationsEnabled", "true");

    const privacyButton = getByText("Privacy Policy");
    fireEvent.press(privacyButton);
    expect(mockRouterPush).toHaveBeenCalledWith("/privacy");

    const termsButton = getByText("Terms of Service");
    fireEvent.press(termsButton);
    expect(mockRouterPush).toHaveBeenCalledWith("/terms");

    const languageButton = getByText("Language");
    fireEvent.press(languageButton);
    expect(await findByText("Select Language")).toBeTruthy();
    expect((await findAllByText("English (English)")).at(1)).toBeTruthy();
    expect(await findByText("Spanish (Español)")).toBeTruthy();
    expect(await findByText("Cancel")).toBeTruthy();

    const deleteAccountButton = getByText("Delete Account");
    fireEvent.press(deleteAccountButton);
    expect(await findByText("Delete Account?")).toBeTruthy();
    expect(
      await findByText(
        "This action cannot be undone. Deleting your account will:",
      ),
    ).toBeTruthy();
    expect(await findByText("Are you sure you want to continue?")).toBeTruthy();
    expect(await findByText("Continue")).toBeTruthy();

    const continueButton = getByText("Continue");
    fireEvent.press(continueButton);
    expect(await findByText("Confirm Account Deletion")).toBeTruthy();
    expect(
      await findByText("Type DELETE to permanently delete your account:"),
    ).toBeTruthy();
    expect(await findByTestId("confirm-delete-btn-text")).toBeTruthy();

    const distanceButton = getByText("Default Distance");
    fireEvent.press(distanceButton);
    expect(await findByText("Pet Sighting Distance")).toBeTruthy();
    expect(await findByText("1 km")).toBeTruthy();
    expect(await findByText("5 km")).toBeTruthy();
    expect(await findByText("10 km")).toBeTruthy();
    expect(await findByText("25 km")).toBeTruthy();
    expect(await findByText("50 km")).toBeTruthy();
    expect(await findByText("100 km")).toBeTruthy();
  });

  it("renders correctly when location is not available", async () => {
    mockGetCurrentUserLocationV3.mockResolvedValue(null);

    const { getByText, findByText, queryByText } = render(
      <TestWrapper user={fakeUser}>
        <SettingsContainer />
      </TestWrapper>,
    );
    expect(getByText("About")).toBeTruthy();
    expect(getByText("Learn more about the app")).toBeTruthy();

    expect(getByText("Location")).toBeTruthy();
    expect(getByText("Location Permission")).toBeTruthy();
    expect(getByText("Disabled")).toBeTruthy();
    expect(getByText("Request")).toBeTruthy();
    expect(getByText("Current Location")).toBeTruthy();
    expect(getByText("Loading...")).toBeTruthy();

    expect(await findByText("No location set")).toBeTruthy();
    expect(queryByText("Loading...")).toBeNull();

    const requestLocationButton = getByText("Request");
    fireEvent.press(requestLocationButton);
    expect(mockGetCurrentUserLocationV3).toHaveBeenCalled();

    expect(await findByText("Grant Location Permission")).toBeTruthy();
    expect(
      await findByText(
        "Turning on your location will allow us to show you nearby pet sightings. You can enable it in your device settings.",
      ),
    ).toBeTruthy();
    expect(await findByText("Open Settings")).toBeTruthy();
    expect(await findByText("Cancel")).toBeTruthy();
    expect(await findByText("No location set")).toBeTruthy();
    expect(queryByText("Loading...")).toBeNull();
    expect(getByText("Disabled")).toBeTruthy();
  });

  it("renders correctly when location access is denied", async () => {
    mockGetCurrentUserLocationV3.mockRejectedValue(new Error("Location error"));

    const { getByText, findByText, queryByText } = render(
      <TestWrapper user={fakeUser}>
        <SettingsContainer />
      </TestWrapper>,
    );
    expect(getByText("About")).toBeTruthy();
    expect(getByText("Learn more about the app")).toBeTruthy();

    expect(getByText("Location")).toBeTruthy();
    expect(getByText("Location Permission")).toBeTruthy();
    expect(getByText("Disabled")).toBeTruthy();
    expect(getByText("Request")).toBeTruthy();
    expect(getByText("Current Location")).toBeTruthy();
    expect(getByText("Loading...")).toBeTruthy();

    expect(await findByText("No location set")).toBeTruthy();
    expect(queryByText("Loading...")).toBeNull();

    const requestLocationButton = getByText("Request");
    fireEvent.press(requestLocationButton);
    expect(mockGetCurrentUserLocationV3).toHaveBeenCalled();

    expect(await findByText("Grant Location Permission")).toBeTruthy();
    expect(
      await findByText(
        "Turning on your location will allow us to show you nearby pet sightings. You can enable it in your device settings.",
      ),
    ).toBeTruthy();
    expect(await findByText("Open Settings")).toBeTruthy();
    expect(await findByText("Cancel")).toBeTruthy();
    expect(await findByText("No location set")).toBeTruthy();
    expect(queryByText("Loading...")).toBeNull();
    expect(getByText("Disabled")).toBeTruthy();
  });

  it("renders correctly with no user", async () => {
    const { getByText, findByText, queryByText } = render(
      <TestWrapper user={null}>
        <SettingsContainer />
      </TestWrapper>,
    );
    expect(getByText("About")).toBeTruthy();
    expect(getByText("Learn more about the app")).toBeTruthy();

    expect(getByText("Location")).toBeTruthy();
    expect(getByText("Location Permission")).toBeTruthy();
    expect(getByText("Disabled")).toBeTruthy();
    expect(getByText("Request")).toBeTruthy();
    expect(getByText("Current Location")).toBeTruthy();
    expect(getByText("Loading...")).toBeTruthy();

    expect(getByText("Notifications")).toBeTruthy();
    expect(getByText("Push Notifications")).toBeTruthy();
    expect(getByText("Get notified about updates and events")).toBeTruthy();

    expect(getByText("Terms of Service")).toBeTruthy();
    expect(getByText("Read our terms and conditions")).toBeTruthy();

    expect(getByText("Privacy Policy")).toBeTruthy();
    expect(getByText("Learn how we handle your data")).toBeTruthy();

    expect(getByText("Language")).toBeTruthy();
    expect(getByText("English (English)")).toBeTruthy();

    expect(getByText("Default Distance")).toBeTruthy();
    expect(getByText("25 km radius")).toBeTruthy();

    expect(queryByText("Delete Account")).toBeNull();
    expect(queryByText("Permanently delete your account and data")).toBeNull();

    expect(getByText("Version 1.0.0")).toBeTruthy();

    expect(await findByText("No location set")).toBeTruthy();
    expect(queryByText("Loading...")).toBeNull();
  });

  it("renders correctly with default language", async () => {
    mockPreferredLanguage = "";
    const { getByText, findByText, queryByText, getByTestId } = render(
      <TestWrapper user={fakeUser}>
        <SettingsContainer />
      </TestWrapper>,
    );
    expect(getByText("About")).toBeTruthy();
    expect(getByText("Learn more about the app")).toBeTruthy();

    expect(getByText("Location")).toBeTruthy();
    expect(getByText("Location Permission")).toBeTruthy();
    expect(getByText("Disabled")).toBeTruthy();
    expect(getByText("Request")).toBeTruthy();
    expect(getByText("Current Location")).toBeTruthy();
    expect(getByText("Loading...")).toBeTruthy();

    expect(getByText("Notifications")).toBeTruthy();
    expect(getByText("Push Notifications")).toBeTruthy();
    expect(getByText("Get notified about updates and events")).toBeTruthy();

    expect(getByText("Terms of Service")).toBeTruthy();
    expect(getByText("Read our terms and conditions")).toBeTruthy();

    expect(getByText("Privacy Policy")).toBeTruthy();
    expect(getByText("Learn how we handle your data")).toBeTruthy();

    expect(getByText("Language")).toBeTruthy();
    expect(getByText("English (Default)")).toBeTruthy();

    expect(getByText("Default Distance")).toBeTruthy();
    expect(getByText("25 km radius")).toBeTruthy();

    expect(getByText("Delete Account")).toBeTruthy();
    expect(getByText("Permanently delete your account and data")).toBeTruthy();

    expect(getByText("Version 1.0.0")).toBeTruthy();

    expect(await findByText("No location set")).toBeTruthy();
    expect(queryByText("Loading...")).toBeNull();

    const aboutButton = getByText("About");
    fireEvent.press(aboutButton);
    expect(mockRouterPush).toHaveBeenCalledWith("/about");

    const requestLocationButton = getByText("Request");
    fireEvent.press(requestLocationButton);
    expect(mockGetCurrentUserLocationV3).toHaveBeenCalled();
    expect(await findByText("Current Location")).toBeTruthy();
    expect(await findByText("Granted")).toBeTruthy();

    const notificationSwitch = getByTestId("notification-switch");
    expect(notificationSwitch.props.value).toBe(false);
    fireEvent(notificationSwitch, "valueChange", true);
    expect(notificationSwitch.props.value).toBe(true);
    expect(mockSetItem).toHaveBeenCalledWith("notificationsEnabled", "true");

    const privacyButton = getByText("Privacy Policy");
    fireEvent.press(privacyButton);
    expect(mockRouterPush).toHaveBeenCalledWith("/privacy");

    const termsButton = getByText("Terms of Service");
    fireEvent.press(termsButton);
    expect(mockRouterPush).toHaveBeenCalledWith("/terms");

    const languageButton = getByText("Language");
    fireEvent.press(languageButton);
    expect(await findByText("Select Language")).toBeTruthy();
    expect(await findByText("English (English)")).toBeTruthy();
    expect(await findByText("Spanish (Español)")).toBeTruthy();
    expect(await findByText("Cancel")).toBeTruthy();

    // select Spanish and verify
    const spanishOption = await findByText("Spanish (Español)");
    fireEvent.press(spanishOption);
    expect(await findByText("Language")).toBeTruthy();
    expect(getByText("Spanish (Español)")).toBeTruthy();
  });
});
