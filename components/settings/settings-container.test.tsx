import { fireEvent, render } from "@testing-library/react-native";
import SettingsContainer from "./settings-container";
import { Provider as PaperProvider } from "react-native-paper";
import { Text } from "react-native";
import { AuthContext } from "../Provider/auth-provider";
import { PermissionContext } from "../Provider/permission-provider";
import { AIFeatureContext } from "../Provider/ai-context-provider";
import { LocaleContext } from "../Provider/locale-provider";

const fakeUser = { id: "test-user-id" };

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options: any) => {
      if (options && options.defaultDistanceValue) {
        return `${options.defaultDistanceValue} km radius`;
      } else if (options && options.versionText) {
        return `Version ${options.versionText}`;
      }
      return key;
    },
  }),
}));

jest.mock("i18next", () => ({
  t: (key: string, options: any) => key,
}));

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
    expect(getByText("about")).toBeTruthy();
    expect(getByText("learnMoreAboutTheApp")).toBeTruthy();

    expect(getByText("location")).toBeTruthy();
    expect(getByText("locationPermission")).toBeTruthy();
    expect(getByText("disabled")).toBeTruthy();
    expect(getByText("request")).toBeTruthy();
    expect(getByText("currentLocation")).toBeTruthy();
    expect(getByText("loading")).toBeTruthy();

    expect(getByText("notifications")).toBeTruthy();
    expect(getByText("pushNotifications")).toBeTruthy();
    expect(getByText("getNotifiedAboutUpdatesAndEvents")).toBeTruthy();

    expect(getByText("termsOfService")).toBeTruthy();
    expect(getByText("readOurTermsAndConditions")).toBeTruthy();

    expect(getByText("privacyPolicy")).toBeTruthy();
    expect(getByText("learnHowWeHandleYourData")).toBeTruthy();

    expect(getByText("language")).toBeTruthy();
    expect(getByText("English (English)")).toBeTruthy();

    expect(getByText("defaultDistance")).toBeTruthy();
    expect(getByText("25 km radius")).toBeTruthy();

    expect(getByText("deleteAccount")).toBeTruthy();
    expect(getByText("permanentlyDeleteYourAccountAndData")).toBeTruthy();

    expect(getByText("Version 1.0.0")).toBeTruthy();

    expect(await findByText("noLocationSet")).toBeTruthy();
    expect(queryByText("loading")).toBeNull();

    const aboutButton = getByText("about");
    fireEvent.press(aboutButton);
    expect(mockRouterPush).toHaveBeenCalledWith("/about");

    const requestLocationButton = getByText("request");
    fireEvent.press(requestLocationButton);
    expect(mockGetCurrentUserLocationV3).toHaveBeenCalled();
    expect(await findByText("currentLocation")).toBeTruthy();
    expect(await findByText("granted")).toBeTruthy();

    const notificationSwitch = getByTestId("notification-switch");
    expect(notificationSwitch.props.value).toBe(false);
    fireEvent(notificationSwitch, "valueChange", true);
    expect(notificationSwitch.props.value).toBe(true);
    expect(mockSetItem).toHaveBeenCalledWith("notificationsEnabled", "true");

    const privacyButton = getByText("privacyPolicy");
    fireEvent.press(privacyButton);
    expect(mockRouterPush).toHaveBeenCalledWith("/privacy");

    const termsButton = getByText("termsOfService");
    fireEvent.press(termsButton);
    expect(mockRouterPush).toHaveBeenCalledWith("/terms");

    const languageButton = getByText("language");
    fireEvent.press(languageButton);
    expect(await findByText("selectLanguage")).toBeTruthy();
    expect((await findAllByText("English (English)")).at(1)).toBeTruthy();
    expect(await findByText("Spanish (Español)")).toBeTruthy();
    expect(await findByText("cancel")).toBeTruthy();

    const deleteAccountButton = getByText("deleteAccount");
    fireEvent.press(deleteAccountButton);
    expect(await findByText("deleteAccount")).toBeTruthy();
    expect(await findByText("thisActionCannotBeUndone")).toBeTruthy();
    expect(await findByText("areYouSureYouWantToContinue")).toBeTruthy();
    expect(await findByText("continue")).toBeTruthy();

    const continueButton = getByText("continue");
    fireEvent.press(continueButton);
    expect(await findByText("confirmAccountDeletion")).toBeTruthy();
    expect(
      await findByTestId("confirm-delete-input-label"),
    ).toBeTruthy();
    expect(
      await findByTestId("confirm-delete-input-label-delete"),
    ).toBeTruthy();
    expect(await findByTestId("confirm-delete-btn-text")).toBeTruthy();

    const distanceButton = getByText("defaultDistance");
    fireEvent.press(distanceButton);
    expect(await findByText("petSightingDistance")).toBeTruthy();
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
    expect(getByText("about")).toBeTruthy();
    expect(getByText("learnMoreAboutTheApp")).toBeTruthy();

    expect(getByText("location")).toBeTruthy();
    expect(getByText("locationPermission")).toBeTruthy();
    expect(getByText("disabled")).toBeTruthy();
    expect(getByText("request")).toBeTruthy();
    expect(getByText("currentLocation")).toBeTruthy();
    expect(getByText("loading")).toBeTruthy();

    expect(await findByText("noLocationSet")).toBeTruthy();
    expect(queryByText("loading")).toBeNull();

    const requestLocationButton = getByText("request");
    fireEvent.press(requestLocationButton);
    expect(mockGetCurrentUserLocationV3).toHaveBeenCalled();

    expect(await findByText("grantLocationPermission")).toBeTruthy();
    expect(await findByText("turningOnLocationMobile")).toBeTruthy();
    expect(await findByText("openSettings")).toBeTruthy();
    expect(await findByText("cancel")).toBeTruthy();
    expect(await findByText("noLocationSet")).toBeTruthy();
    expect(queryByText("loading")).toBeNull();
    expect(getByText("disabled")).toBeTruthy();
  });

  it("renders correctly when location access is denied", async () => {
    mockGetCurrentUserLocationV3.mockRejectedValue(new Error("Location error"));

    const { getByText, findByText, queryByText } = render(
      <TestWrapper user={fakeUser}>
        <SettingsContainer />
      </TestWrapper>,
    );
    expect(getByText("about")).toBeTruthy();
    expect(getByText("learnMoreAboutTheApp")).toBeTruthy();

    expect(getByText("location")).toBeTruthy();
    expect(getByText("locationPermission")).toBeTruthy();
    expect(getByText("disabled")).toBeTruthy();
    expect(getByText("request")).toBeTruthy();
    expect(getByText("currentLocation")).toBeTruthy();
    expect(getByText("loading")).toBeTruthy();

    expect(await findByText("noLocationSet")).toBeTruthy();
    expect(queryByText("loading")).toBeNull();

    const requestLocationButton = getByText("request");
    fireEvent.press(requestLocationButton);
    expect(mockGetCurrentUserLocationV3).toHaveBeenCalled();

    expect(await findByText("grantLocationPermission")).toBeTruthy();
    expect(await findByText("turningOnLocationMobile")).toBeTruthy();
    expect(await findByText("openSettings")).toBeTruthy();
    expect(await findByText("cancel")).toBeTruthy();
    expect(await findByText("noLocationSet")).toBeTruthy();
    expect(queryByText("loading")).toBeNull();
    expect(getByText("disabled")).toBeTruthy();
  });

  it("renders correctly with no user", async () => {
    const { getByText, findByText, queryByText } = render(
      <TestWrapper user={null}>
        <SettingsContainer />
      </TestWrapper>,
    );
    expect(getByText("about")).toBeTruthy();
    expect(getByText("learnMoreAboutTheApp")).toBeTruthy();

    expect(getByText("location")).toBeTruthy();
    expect(getByText("locationPermission")).toBeTruthy();
    expect(getByText("disabled")).toBeTruthy();
    expect(getByText("request")).toBeTruthy();
    expect(getByText("currentLocation")).toBeTruthy();
    expect(getByText("loading")).toBeTruthy();

    expect(getByText("notifications")).toBeTruthy();
    expect(getByText("pushNotifications")).toBeTruthy();
    expect(getByText("getNotifiedAboutUpdatesAndEvents")).toBeTruthy();

    expect(getByText("termsOfService")).toBeTruthy();
    expect(getByText("readOurTermsAndConditions")).toBeTruthy();

    expect(getByText("privacyPolicy")).toBeTruthy();
    expect(getByText("learnHowWeHandleYourData")).toBeTruthy();

    expect(getByText("language")).toBeTruthy();
    expect(getByText("English (English)")).toBeTruthy();

    expect(getByText("defaultDistance")).toBeTruthy();
    expect(getByText("25 km radius")).toBeTruthy();

    expect(queryByText("deleteAccount")).toBeNull();
    expect(queryByText("permanentlyDeleteYourAccountAndData")).toBeNull();

    expect(getByText("Version 1.0.0")).toBeTruthy();

    expect(await findByText("noLocationSet")).toBeTruthy();
    expect(queryByText("loading")).toBeNull();
  });

  it("renders correctly with default language", async () => {
    mockPreferredLanguage = "";
    const { getByText, findByText, queryByText, getByTestId } = render(
      <TestWrapper user={fakeUser}>
        <SettingsContainer />
      </TestWrapper>,
    );
    expect(getByText("about")).toBeTruthy();
    expect(getByText("learnMoreAboutTheApp")).toBeTruthy();

    expect(getByText("location")).toBeTruthy();
    expect(getByText("locationPermission")).toBeTruthy();
    expect(getByText("disabled")).toBeTruthy();
    expect(getByText("request")).toBeTruthy();
    expect(getByText("currentLocation")).toBeTruthy();
    expect(getByText("loading")).toBeTruthy();

    expect(getByText("notifications")).toBeTruthy();
    expect(getByText("pushNotifications")).toBeTruthy();
    expect(getByText("getNotifiedAboutUpdatesAndEvents")).toBeTruthy();

    expect(getByText("termsOfService")).toBeTruthy();
    expect(getByText("readOurTermsAndConditions")).toBeTruthy();

    expect(getByText("privacyPolicy")).toBeTruthy();
    expect(getByText("learnHowWeHandleYourData")).toBeTruthy();

    expect(getByText("language")).toBeTruthy();
    expect(getByText("English (Default)")).toBeTruthy();

    expect(getByText("defaultDistance")).toBeTruthy();
    expect(getByText("25 km radius")).toBeTruthy();

    expect(getByText("deleteAccount")).toBeTruthy();
    expect(getByText("permanentlyDeleteYourAccountAndData")).toBeTruthy();

    expect(getByText("Version 1.0.0")).toBeTruthy();

    expect(await findByText("noLocationSet")).toBeTruthy();
    expect(queryByText("loading")).toBeNull();

    const aboutButton = getByText("about");
    fireEvent.press(aboutButton);
    expect(mockRouterPush).toHaveBeenCalledWith("/about");

    const requestLocationButton = getByText("request");
    fireEvent.press(requestLocationButton);
    expect(mockGetCurrentUserLocationV3).toHaveBeenCalled();
    expect(await findByText("currentLocation")).toBeTruthy();
    expect(await findByText("granted")).toBeTruthy();

    const notificationSwitch = getByTestId("notification-switch");
    expect(notificationSwitch.props.value).toBe(false);
    fireEvent(notificationSwitch, "valueChange", true);
    expect(notificationSwitch.props.value).toBe(true);
    expect(mockSetItem).toHaveBeenCalledWith("notificationsEnabled", "true");

    const privacyButton = getByText("privacyPolicy");
    fireEvent.press(privacyButton);
    expect(mockRouterPush).toHaveBeenCalledWith("/privacy");

    const termsButton = getByText("termsOfService");
    fireEvent.press(termsButton);
    expect(mockRouterPush).toHaveBeenCalledWith("/terms");

    const languageButton = getByText("language");
    fireEvent.press(languageButton);
    expect(await findByText("selectLanguage")).toBeTruthy();
    expect(await findByText("English (English)")).toBeTruthy();
    expect(await findByText("Spanish (Español)")).toBeTruthy();
    expect(await findByText("cancel")).toBeTruthy();

    // select Spanish and verify
    const spanishOption = await findByText("Spanish (Español)");
    fireEvent.press(spanishOption);
    expect(await findByText("language")).toBeTruthy();
    expect(getByText("Spanish (Español)")).toBeTruthy();
  });
});
