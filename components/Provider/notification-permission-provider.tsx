import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  isNotificationPermissionGranted,
  requestNotificationPermission,
} from "../notification-util";
import { saveStorageItem } from "../util";
import { SIGHTING_NOTIFICATION_ENABLED_KEY } from "../constants";

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

  const saveNotificationPermission = useCallback(
    (value: boolean) => {
      if (value === true) {
        isNotificationPermissionGranted()
          .then((granted) => {
            if (!granted) {
              return requestNotificationPermission();
            }
            return granted;
          })
          .then((granted) => {
            saveStorageItem(SIGHTING_NOTIFICATION_ENABLED_KEY, "true");
            setEnabledNotificationPermission(granted);
          })
          .catch(() => {
            setEnabledNotificationPermission(false);
          });
      } else {
        saveStorageItem(SIGHTING_NOTIFICATION_ENABLED_KEY, "false");
        setEnabledNotificationPermission(false);
      }
    },
    [],
  );

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
