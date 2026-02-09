import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { log } from "../logs";
import {
  getCurrentUserLocationV3,
  SightingLocation,
} from "../get-current-location";
import { getStorageItem, saveStorageItem } from "../util";
import { SIGHTING_LOCATION_KEY } from "../constants";
type ContextProps = {
  enabledLocationPermission?: boolean;
  location?: SightingLocation;
  refreshPermission: () => Promise<void>;
  saveLocation: (location: SightingLocation) => void;
  getSavedLocation: () => Promise<any>;
  setLocation: (value: SightingLocation) => void;
};

const PermissionContext = createContext<Partial<ContextProps>>({});

interface Props {
  children: React.ReactNode;
}

const PermissionProvider = (props: Props) => {
  const [enabledLocationPermission, setEnabledLocationPermission] =
    useState<boolean>(false);
  const [location, setLocation] = useState<SightingLocation>();

  const getSavedLocation = useCallback(async () => {
    try {
      const location = await getStorageItem(SIGHTING_LOCATION_KEY);
      if (location) {
        return JSON.parse(location);
      }
    } catch {
      return;
    }
  }, []);

  const saveLocation = useCallback((location: SightingLocation) => {
    saveStorageItem(SIGHTING_LOCATION_KEY, JSON.stringify(location));
  }, []);

  const refreshPermission = useCallback(async () => {
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
            }
          });
        }
      })
      .catch((err) => {
        getSavedLocation().then((location) => {
          if (location) {
            setLocation(location);
          } else {
            log(`getCurrentUserLocationV3 ${err.message}`);
          }
        });
      });
  }, [getSavedLocation, saveLocation]);

  useEffect(() => {
    refreshPermission();
  }, []);

  return (
    <PermissionContext.Provider
      value={{
        enabledLocationPermission,
        location,
        refreshPermission,
        saveLocation,
        getSavedLocation,
        setLocation,
      }}
    >
      {props.children}
    </PermissionContext.Provider>
  );
};

export function usePermission() {
  const ctx = useContext(PermissionContext);
  if (!ctx)
    throw new Error("usePermission must be used inside PermissionProvider");
  return ctx;
}

export { PermissionContext, PermissionProvider };
