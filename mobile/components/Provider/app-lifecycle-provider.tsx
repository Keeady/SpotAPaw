import { useCallback, useEffect, useRef } from "react";
import { AppState } from "react-native";
import { usePermission } from "./permission-provider";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

function AppLifecycleProvider({ children }: Props) {
  const appState = useRef(AppState.currentState);
  const { getExistingPermission } = usePermission();

  const subscribe = useCallback(() => {
    return AppState.addEventListener("change", (nextAppState) => {
      // When app comes back to foreground from background
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        if (getExistingPermission) {
          getExistingPermission();
        }
      }
      appState.current = nextAppState;
    });
  }, [getExistingPermission]);

  useEffect(() => {
    const subscription = subscribe();

    return () => {
      subscription.remove();
    };
  }, [subscribe]);

  return children;
}

export { AppLifecycleProvider };
