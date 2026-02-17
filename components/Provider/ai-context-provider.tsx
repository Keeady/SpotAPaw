import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { getStorageItem, saveStorageItem } from "../util";
import { SIGHTING_AI_ENABLED_KEY } from "../constants";
type ContextProps = {
  isAiFeatureEnabled: boolean;
  saveAIFeatureContext: (value: boolean) => void;
};

const AIFeatureContext = createContext<Partial<ContextProps>>({});

interface Props {
  children: React.ReactNode;
}

const AIFeatureContextProvider = (props: Props) => {
  const [isAiFeatureEnabled, setAiFeatureEnabled] = useState<boolean>(false);

  const getIsAiFeatureEnabled = useCallback(async () => {
    try {
      const aiFeature = await getStorageItem(SIGHTING_AI_ENABLED_KEY);
      setAiFeatureEnabled(aiFeature === "true" || aiFeature === null);
    } catch {
      return false;
    }
  }, []);

  const saveAIFeatureContext = useCallback((value: boolean) => {
    setAiFeatureEnabled(value);
    saveStorageItem(SIGHTING_AI_ENABLED_KEY, value.toString());
  }, []);

  useEffect(() => {
    getIsAiFeatureEnabled();
  }, [getIsAiFeatureEnabled]);

  return (
    <AIFeatureContext.Provider
      value={{
        isAiFeatureEnabled,
        saveAIFeatureContext,
      }}
    >
      {props.children}
    </AIFeatureContext.Provider>
  );
};

export function useAIFeatureContext() {
  const ctx = useContext(AIFeatureContext);
  if (!ctx) throw new Error("Context unavailable.");
  return ctx;
}

export { AIFeatureContext, AIFeatureContextProvider };
