import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  getStorageItem,
  saveStorageItem,
} from "../util";
import { PREFERRED_LANGUAGE } from "../constants";
import { log } from "../logs";

type ContextProps = {
  preferredLanguage: string;
  saveLanguageContext: (value: string) => void;
};
import { getLocales } from "expo-localization";
import i18next from "i18next";

const LocaleContext = createContext<Partial<ContextProps>>({});

interface Props {
  children: React.ReactNode;
}

const LocaleContextProvider = (props: Props) => {
  const defaultLanguage = getLocales()[0].languageTag || "en";
  const [language, setLanguage] = useState<string>(defaultLanguage);

  const getLanguage = useCallback(async () => {
    try {
      const storedLanguage = await getStorageItem(PREFERRED_LANGUAGE);
      setLanguage(storedLanguage || defaultLanguage);
    } catch {
      log("Error loading language context");
      return false;
    }
  }, []);

  const saveLanguageContext = useCallback((value: string) => {
    setLanguage(value);
    saveStorageItem(PREFERRED_LANGUAGE, value);
    i18next.changeLanguage(value).catch((error) => {
      log("Failed to change language");
    });
  }, []);

  useEffect(() => {
    getLanguage();
  }, [getLanguage]);

  return (
    <LocaleContext.Provider
      value={{
        preferredLanguage: language,
        saveLanguageContext,
      }}
    >
      {props.children}
    </LocaleContext.Provider>
  );
};

export function useLocaleContext() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("Context unavailable.");
  return ctx;
}

export { LocaleContext, LocaleContextProvider };
