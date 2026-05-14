import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { saveStorageItem } from "../util";
import {
  SIGHTING_NOTIFICATION_ENABLED_KEY,
} from "../constants";
import * as Notifications from "expo-notifications";
import { isNotificationPermissionGranted } from "../notification-util";

type ContextProps = {
  enabledNotificationPermission?: boolean;
  saveNotificationPermission: (value: boolean) => void;
  isLoadingNotification: boolean;
  getExistingNotificationPermission: () => Promise<void>;
};

const NotificationPermissionContext = createContext<Partial<ContextProps>>({});

interface Props {
  children: React.ReactNode;
}

const NotificationPermissionProvider = (props: Props) => {
  const [enabledNotificationPermission, setEnabledNotificationPermission] =
    useState<boolean>(false);
  const [isLoadingNotification, setLoadingNotification] = useState(false);

  const requestNotificationPermission = useCallback(async (): Promise<boolean> => {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
  }, []);

  const saveNotificationPermission = useCallback((value: boolean) => {
    if (value) {
      isNotificationPermissionGranted()
        .then((granted) => {
          if (!granted) {
            return requestNotificationPermission();
          }
          return granted;
        })
        .then((granted) => {
          setEnabledNotificationPermission(granted);
        })
        .catch(() => {
          setEnabledNotificationPermission(false);
        });
    } else {
      setEnabledNotificationPermission(false);
    }
  }, []);

  const getExistingNotificationPermission = useCallback(async () => {
    setLoadingNotification(true);
    isNotificationPermissionGranted()
      .then((status) => {
        setEnabledNotificationPermission(status);
      })
      .catch(() => {
        setEnabledNotificationPermission(false);
      })
      .finally(() => {
        setLoadingNotification(false);
      });
  }, []);

  useEffect(() => {
    getExistingNotificationPermission();
  }, [getExistingNotificationPermission]);

  return (
    <NotificationPermissionContext.Provider
      value={{
        enabledNotificationPermission,
        saveNotificationPermission,
        isLoadingNotification,
        getExistingNotificationPermission,
      }}
    >
      {props.children}
    </NotificationPermissionContext.Provider>
  );
};

export function useNotificationPermission() {
  const ctx = useContext(NotificationPermissionContext);
  if (!ctx) throw new Error("Context unavailable.");
  return ctx;
}

export { NotificationPermissionContext, NotificationPermissionProvider };
