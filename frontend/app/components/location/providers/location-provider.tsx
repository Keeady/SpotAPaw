import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { SightingLocation } from "../location";
import { getStorageItem, saveStorageItem } from "@/app/utils/local-storage";

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

const SIGHTING_LOCATION_KEY = "sightingLocation";

const PermissionContext = createContext<Partial<ContextProps>>({});

interface Props {
  children: React.ReactNode;
}

const PermissionProvider = (props: Props) => {
  const [enabledLocationPermission, setEnabledLocationPermission] =
    useState<boolean>(false);
  const [location, setLocation] = useState<SightingLocation>();
  const [isLoadingLocation, setLoadingLocation] = useState(false);

  const getExistingPermission = useCallback(async () => {
    setLoadingLocation(true);
    (navigator.geolocation.getCurrentPosition((pos) => {
      setEnabledLocationPermission(true);
      setLoadingLocation(false);
      if (pos) {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      } else {
        getSavedLocation().then((location) => {
          if (location) {
            setLocation(location);
          }
        });
      }
    }),
      () => {
        setLoadingLocation(false);
        console.log("Using saved location");

        getSavedLocation().then((location) => {
          if (location) {
            setLocation(location);
          }
        });
      });
  }, []);

  const refreshPermission = useCallback(async () => {
    setLoadingLocation(true);
    (navigator.geolocation.getCurrentPosition((pos) => {
      setEnabledLocationPermission(true);
      setLoadingLocation(false);
      if (pos) {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        saveLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      } else {
        getSavedLocation().then((location) => {
          if (location) {
            setLocation(location);
          }
        });
      }
    }),
      () => {
        setLoadingLocation(false);
        console.log("Using saved location");

        getSavedLocation().then((location) => {
          if (location) {
            setLocation(location);
          }
        });
      });
  }, []);

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
        getExistingPermission,
      }}
    >
      {props.children}
    </PermissionContext.Provider>
  );
};

export function usePermission() {
  const ctx = useContext(PermissionContext);
  if (!ctx) throw new Error("Context unavailable.");
  return ctx;
}

export { PermissionContext, PermissionProvider };

export const getSavedLocation = async () => {
  try {
    const location = await getStorageItem(SIGHTING_LOCATION_KEY);
    if (location) {
      return JSON.parse(location);
    }
  } catch {
    return;
  }
};

export const saveLocation = (location: SightingLocation) => {
  saveStorageItem(SIGHTING_LOCATION_KEY, JSON.stringify(location));
};
