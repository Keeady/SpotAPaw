import { render, waitFor } from "@testing-library/react-native";
import React from "react";
import Layout from "../_layout";
import { AuthContext } from "@/components/Provider/auth-provider";

const mockUser = {
  id: "user-123",
  email: "test@example.com",
};

const mockSetNotificationHandler = jest.fn();
const mockGetLastNotificationResponse = jest.fn().mockReturnValue(null);
const mockAddNotificationResponseReceivedListener = jest
  .fn()
  .mockReturnValue({ remove: jest.fn() });
const mockAddNotificationReceivedListener = jest
  .fn()
  .mockReturnValue({ remove: jest.fn() });
const mockDismissNotificationAsync = jest.fn().mockResolvedValue(null);

const mockPush = jest.fn();
const mockReplace = jest.fn();

const mockI18nInstance = {
  t: (key: string) => key,
  language: "en",
  on: jest.fn(),
  off: jest.fn(),
};
const mockInitI18next = jest.fn().mockResolvedValue(mockI18nInstance);

const mockRegisterForNotifications = jest.fn();

jest.mock("expo-notifications", () => ({
  setNotificationHandler: (handler: any) => mockSetNotificationHandler(handler),
  getLastNotificationResponse: () => mockGetLastNotificationResponse(),
  dismissNotificationAsync: (id: any) => mockDismissNotificationAsync(id),
  addNotificationResponseReceivedListener: (cb: any) =>
    mockAddNotificationResponseReceivedListener(cb),
  addNotificationReceivedListener: (cb: any) =>
    mockAddNotificationReceivedListener(cb),
}));

jest.mock("expo-router", () => {
  const actual = jest.requireActual("expo-router");
  const Screen = (_props: any) => null; 

  const Stack = ({ children }: any) => {
    return <>{children}</>;
  };
  Stack.Screen = Screen;
  return {
    ...actual,
    Stack: Stack,
    useRouter: () => ({
      push: mockPush,
      replace: mockReplace,
    }),
  };
});

jest.mock("@/i18n", () => ({
  initI18next: () => mockInitI18next(),
}));

jest.mock("@/components/Provider/auth-provider", () => {
  const React = jest.requireActual("react");
  return {
    AuthProvider: ({ children }: any) => <>{children}</>,
    AuthContext: React.createContext({
      user: null,
      session: null,
      loading: false,
    }),
  };
});

jest.mock("@/components/Provider/permission-provider", () => ({
  PermissionProvider: ({ children }: any) => <>{children}</>,
}));

jest.mock("@/components/Provider/ai-context-provider", () => ({
  AIFeatureContextProvider: ({ children }: any) => <>{children}</>,
}));

jest.mock("@/components/Provider/pro-context-provider", () => ({
  ProContextProvider: ({ children }: any) => <>{children}</>,
}));

jest.mock("@/components/Provider/locale-provider", () => ({
  LocaleContextProvider: ({ children }: any) => <>{children}</>,
}));

jest.mock("@/components/Provider/notification-permission-provider", () => ({
  NotificationPermissionProvider: ({ children }: any) => <>{children}</>,
}));

jest.mock("@/components/Provider/app-lifecycle-provider", () => ({
  AppLifecycleProvider: ({ children }: any) => <>{children}</>,
}));

jest.mock("@/auth/auth", () => ({
  AuthHandler: jest.fn().mockImplementation(() => ({
    exchangeCodeForSession: jest.fn().mockResolvedValue({ error: null }),
  })),
}));

jest.mock("@/components/util", () => ({
  createErrorLogMessage: jest.fn((error) => error?.message ?? "Unknown error"),
  handleSignOut: jest.fn(),
}));

jest.mock("@/components/logs", () => ({
  log: jest.fn(),
}));

jest.mock("@/components/notification-util", () => ({
  registerForNotifications: () => mockRegisterForNotifications(),
}));

jest.mock("react-native-flash-message", () => ({
  __esModule: true,
  showMessage: jest.fn(),
  default: () => null, // FlashMessage default export
}));

jest.mock("react-native-paper", () => ({
  PaperProvider: ({ children }: any) => <>{children}</>,
  MD3LightTheme: {},
  ActivityIndicator: () => null,
}));

jest.mock("@/components/header/header-right", () => () => null);
jest.mock("@/components/header/header-left", () => ({
  HeaderLeft: () => null,
}));

jest.mock("@/components/layout.style", () => ({
  root: {},
  container: {},
  content: {},
}));

const renderWithAuthContext = (user: any = null) => {
  return render(
    <AuthContext.Provider value={{ user, session: null, loading: false }}>
      <Layout />
    </AuthContext.Provider>,
  );
};

describe("Layout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockInitI18next.mockResolvedValue(mockI18nInstance);
    mockGetLastNotificationResponse.mockReturnValue(null);
  });

  it("renders correctly and calls all initialisation hooks", async () => {

    renderWithAuthContext(null);

    await waitFor(() => {
      expect(mockInitI18next).toHaveBeenCalledTimes(1);
      expect(mockSetNotificationHandler).toHaveBeenCalledTimes(1);
      expect(mockRegisterForNotifications).toHaveBeenCalledTimes(1);
      expect(mockGetLastNotificationResponse).toHaveBeenCalled();
      expect(mockAddNotificationResponseReceivedListener).toHaveBeenCalled();
      expect(mockAddNotificationReceivedListener).toHaveBeenCalled();
    });
  });
  
  it("navigates to sighting when last notification response has a sightingId (logged-in user)", async () => {
    mockGetLastNotificationResponse.mockReturnValue({
      notification: {
        request: {
          identifier: "notif-1",
          content: {
            data: { sightingId: "s-1", linkedSightingId: "ls-1", petId: "p-1" },
          },
        },
      },
    });

    renderWithAuthContext(mockUser);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        "/(app)/my-sightings/s-1?linkedSightingId=ls-1&petId=p-1"
      );
    });
  });

  it("navigates to public sightings route when no user is logged in", async () => {
    mockGetLastNotificationResponse.mockReturnValue({
      notification: {
        request: {
          identifier: "notif-2",
          content: {
            data: { sightingId: "s-2", linkedSightingId: "ls-2", petId: "p-2" },
          },
        },
      },
    });

    renderWithAuthContext(null); // no user

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        "/sightings/s-2?linkedSightingId=ls-2&petId=p-2"
      );
    });
  });

  it("cleans up notification listeners on unmount", async () => {
    const removeResponse = jest.fn();
    const removeReceived = jest.fn();
    mockAddNotificationResponseReceivedListener.mockReturnValue({ remove: removeResponse });
    mockAddNotificationReceivedListener.mockReturnValue({ remove: removeReceived });

    const { unmount } = renderWithAuthContext(null);

    await waitFor(() => {
      expect(mockAddNotificationResponseReceivedListener).toHaveBeenCalled();
    });

    unmount();

    expect(removeResponse).toHaveBeenCalled();
    expect(removeReceived).toHaveBeenCalled();
  });
});
