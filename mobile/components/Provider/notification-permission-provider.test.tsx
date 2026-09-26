import { render, waitFor } from "@testing-library/react-native";
import { useContext } from "react";
import {
  NotificationPermissionContext,
  NotificationPermissionProvider,
} from "./notification-permission-provider";

const mockSaveStorageItem = jest.fn();
jest.mock("../util", () => ({
  saveStorageItem: (key: string, value: string) =>
    mockSaveStorageItem(key, value),
}));

const mockIsNotificationPermissionGranted = jest.fn().mockResolvedValue(false);
const mockRequestNotificationPermission = jest.fn().mockResolvedValue(true);
jest.mock("../notification-util", () => ({
  isNotificationPermissionGranted: () => mockIsNotificationPermissionGranted(),
  requestNotificationPermission: () => mockRequestNotificationPermission(),
}));

describe("NotificationPermissionProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it("provides the correct notification permission status when isNotificationPermissionGranted is false", async () => {
    let contextValue: any;
    const TestComponent = () => {
      contextValue = useContext(NotificationPermissionContext);
      return null;
    };

    render(
      <NotificationPermissionProvider>
        <TestComponent />
      </NotificationPermissionProvider>,
    );

    await waitFor(() => {
      expect(contextValue).toBeDefined();
      expect(contextValue.enabledNotificationPermission).toBe(false);
      expect(contextValue.isLoadingNotification).toBe(false);
    });
  });

  it("provides the correct notification permission status when isNotificationPermissionGranted is true", async () => {
    mockIsNotificationPermissionGranted.mockResolvedValue(true);
    let contextValue: any;
    const TestComponent = () => {
      contextValue = useContext(NotificationPermissionContext);
      return null;
    };

    render(
      <NotificationPermissionProvider>
        <TestComponent />
      </NotificationPermissionProvider>,
    );

    await waitFor(() => {
      expect(contextValue).toBeDefined();
      expect(contextValue.enabledNotificationPermission).toBe(true);
      expect(contextValue.isLoadingNotification).toBe(false);
    });
  });

  it("provides the correct notification permission status when isNotificationPermissionGranted throws an error", async () => {
    mockIsNotificationPermissionGranted.mockRejectedValue(
      new Error("Test error"),
    );
    let contextValue: any;
    const TestComponent = () => {
      contextValue = useContext(NotificationPermissionContext);
      return null;
    };

    render(
      <NotificationPermissionProvider>
        <TestComponent />
      </NotificationPermissionProvider>,
    );

    await waitFor(() => {
      expect(contextValue).toBeDefined();
      expect(contextValue.enabledNotificationPermission).toBe(false);
      expect(contextValue.isLoadingNotification).toBe(false);
    });
  });

  it("saves the correct notification permission status when saveNotificationPermission is called and permission is granted", async () => {
    mockIsNotificationPermissionGranted.mockResolvedValue(false);
    mockRequestNotificationPermission.mockResolvedValue(true);

    let contextValue: any;
    const TestComponent = () => {
      contextValue = useContext(NotificationPermissionContext);
      return null;
    };

    render(
      <NotificationPermissionProvider>
        <TestComponent />
      </NotificationPermissionProvider>,
    );

    await waitFor(() => {
      expect(contextValue).toBeDefined();
      expect(contextValue.enabledNotificationPermission).toBe(false);
      expect(contextValue.isLoadingNotification).toBe(false);
    });

    contextValue.saveNotificationPermission(true);

    await waitFor(() => {
      expect(mockIsNotificationPermissionGranted).toHaveBeenCalled();
      expect(mockRequestNotificationPermission).toHaveBeenCalled();
      expect(mockSaveStorageItem).toHaveBeenCalledWith(
        "notificationsEnabled",
        "true",
      );
      expect(contextValue.enabledNotificationPermission).toBe(true);
    });
  });

  it("saves the correct notification permission status when saveNotificationPermission is called and permission is denied", async () => {
    mockIsNotificationPermissionGranted.mockResolvedValue(false);
    mockRequestNotificationPermission.mockResolvedValue(false);

    let contextValue: any;
    const TestComponent = () => {
      contextValue = useContext(NotificationPermissionContext);
      return null;
    };

    render(
      <NotificationPermissionProvider>
        <TestComponent />
      </NotificationPermissionProvider>,
    );

    await waitFor(() => {
      expect(contextValue).toBeDefined();
      expect(contextValue.enabledNotificationPermission).toBe(false);
      expect(contextValue.isLoadingNotification).toBe(false);
    });

    contextValue.saveNotificationPermission(true);
    await waitFor(() => {
      expect(contextValue.enabledNotificationPermission).toBe(false);

      expect(mockIsNotificationPermissionGranted).toHaveBeenCalled();
      expect(mockRequestNotificationPermission).toHaveBeenCalled();
      expect(mockSaveStorageItem).toHaveBeenCalledWith(
        "notificationsEnabled",
        "false",
      );
    });
  });

  it("saves the correct notification permission status when saveNotificationPermission is called and isNotificationPermissionGranted throws an error", async () => {
    mockIsNotificationPermissionGranted.mockRejectedValue(
      new Error("Test error"),
    );

    let contextValue: any;
    const TestComponent = () => {
      contextValue = useContext(NotificationPermissionContext);
      return null;
    };

    render(
      <NotificationPermissionProvider>
        <TestComponent />
      </NotificationPermissionProvider>,
    );

    await waitFor(() => {
      expect(contextValue).toBeDefined();
      expect(contextValue.enabledNotificationPermission).toBe(false);
      expect(contextValue.isLoadingNotification).toBe(false);
    });

    contextValue.saveNotificationPermission(true);
    await waitFor(() => {
      expect(contextValue.enabledNotificationPermission).toBe(false);

      expect(mockIsNotificationPermissionGranted).toHaveBeenCalled();
      expect(mockRequestNotificationPermission).not.toHaveBeenCalled();
      expect(mockSaveStorageItem).not.toHaveBeenCalled();
    });
  });

  it("saves the correct notification permission status when saveNotificationPermission is called with false", async () => {
    let contextValue: any;
    const TestComponent = () => {
      contextValue = useContext(NotificationPermissionContext);
      return null;
    };

    render(
      <NotificationPermissionProvider>
        <TestComponent />
      </NotificationPermissionProvider>,
    );

    await waitFor(() => {
      expect(contextValue).toBeDefined();
      expect(contextValue.enabledNotificationPermission).toBe(false);
      expect(contextValue.isLoadingNotification).toBe(false);
    });

    await waitFor(() => {
      contextValue.saveNotificationPermission(false);
      expect(contextValue.enabledNotificationPermission).toBe(false);
    });

    await waitFor(() => {
      expect(mockIsNotificationPermissionGranted).toHaveBeenCalled();
      expect(mockRequestNotificationPermission).not.toHaveBeenCalled();
      expect(mockSaveStorageItem).toHaveBeenCalledWith(
        "notificationsEnabled",
        "false",
      );
    });
  });
});
