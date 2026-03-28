import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  getCurrentUserLocationV3,
  getExistingUserLocation,
  SightingLocation,
} from "../get-current-location";
import { getStorageItem, saveStorageItem } from "../util";
import { SIGHTING_LOCATION_KEY } from "../constants";
import { LocationPermissionDeniedDialog } from "../location-request-util";
import { log } from "../logs";
type ContextProps = {
  enabledLocationPermission?: boolean;
  location?: SightingLocation;
  refreshPermission: () => Promise<void>;
  saveLocation: (location: SightingLocation) => void;
  getSavedLocation: () => Promise<any>;
  setLocation: (value: SightingLocation) => void;
  isLoadingLocation: boolean;
  getExistingPermission: () => Promise<void>;
};

const PermissionContext = createContext<Partial<ContextProps>>({});

interface Props {
  children: React.ReactNode;
}

const PermissionProvider = (props: Props) => {
  const [permissionDeniedDialogVisible, setPermissionDeniedDialogVisible] =
    useState(false);
  const [enabledLocationPermission, setEnabledLocationPermission] =
    useState<boolean>(false);
  const [location, setLocation] = useState<SightingLocation>();
  const [isLoadingLocation, setLoadingLocation] = useState(false);

  const getSavedLocation = useCallback(async () => {
    try {
      const location = await getStorageItem(SIGHTING_LOCATION_KEY);
      if (location) {
        return JSON.parse(location);
      }
    } catch {
      log("Failed to get saved location");
      return;
    }
  }, []);

  const saveLocation = useCallback((location: SightingLocation) => {
    saveStorageItem(SIGHTING_LOCATION_KEY, JSON.stringify(location));
  }, []);

  const getExistingPermission = useCallback(async () => {
    setLoadingLocation(true);
    getExistingUserLocation()
      .then((location) => {
        setEnabledLocationPermission(true);
        if (location) {
          setLocation(location);
        }
      })
      .catch(() => {
        log("Failed to get existing location");
      })
      .finally(() => {
        setLoadingLocation(false);
      });
  }, []);

  const refreshPermission = useCallback(async () => {
    setLoadingLocation(true);
    getCurrentUserLocationV3()
      .then((location) => {
        setEnabledLocationPermission(true);
        if (location) {
          setLocation(location);
          saveLocation(location);
        } else {
          getSavedLocation().then((location) => {
            if (location) {
              setLocation(location);
            } else {
              setPermissionDeniedDialogVisible(true);
            }
          });
        }
      })
      .catch(() => {
        log("Failed to get refreshed location");
        getSavedLocation().then((location) => {
          if (location) {
            setLocation(location);
          } else {
            setPermissionDeniedDialogVisible(true);
          }
        });
      })
      .finally(() => {
        setLoadingLocation(false);
      });
  }, [getSavedLocation, saveLocation]);

  useEffect(() => {
    getExistingPermission();
  }, [getExistingPermission]);

  return (
    <PermissionContext.Provider
      value={{
        enabledLocationPermission,
        location,
        refreshPermission,
        saveLocation,
        getSavedLocation,
        setLocation,
        isLoadingLocation,
        getExistingPermission
      }}
    >
      {props.children}
      {/* Permission Denied Dialog */}
      <LocationPermissionDeniedDialog
        permissionDeniedDialogVisible={permissionDeniedDialogVisible}
        setPermissionDeniedDialogVisible={setPermissionDeniedDialogVisible}
      />
    </PermissionContext.Provider>
  );
};

export function usePermission() {
  const ctx = useContext(PermissionContext);
  if (!ctx) throw new Error("Context unavailable.");
  return ctx;
}

export { PermissionContext, PermissionProvider };
