import { useCallback, useEffect, useRef } from "react";
import { AppState } from "react-native";
import { usePermission } from "./permission-provider";

interface Props {
  children: React.ReactNode;
}

function AppLifecycleProvider({ children }: Props) {
  const appState = useRef(AppState.currentState);
  const { refreshPermission } = usePermission();

  const subscribe = useCallback(() => {
    return AppState.addEventListener("change", (nextAppState) => {
      // When app comes back to foreground from background
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        if (refreshPermission) {
          refreshPermission();
        }
      }
      appState.current = nextAppState;
    });
  }, [refreshPermission]);

  useEffect(() => {
    const subscription = subscribe();

    return () => {
      subscription.remove();
    };
  }, []);

  return children;
}

export { AppLifecycleProvider };
