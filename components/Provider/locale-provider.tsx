import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { getStorageItem, saveStorageItem } from "../util";
import { PREFERRED_LANGUAGE } from "../constants";
import { log } from "../logs";
import { getLocales } from "expo-localization";
import { changeLanguage } from "i18next";
import { I18nManager } from "react-native";
import * as Updates from "expo-updates";

type ContextProps = {
  preferredLanguage: string;
  saveLanguageContext: (value: string) => void;
};

const LocaleContext = createContext<Partial<ContextProps>>({});

interface Props {
  children: React.ReactNode;
}

const LocaleContextProvider = (props: Props) => {
  const defaultLanguage = getLocales()[0].languageCode || "en";
  const [language, setLanguage] = useState<string>(defaultLanguage);

  const switchLanguage = async (locale: string) => {
    const isArabic = locale === "ar";
    if (I18nManager.isRTL !== isArabic) {
      I18nManager.forceRTL(isArabic);
      I18nManager.allowRTL(isArabic);
      await Updates.reloadAsync();
    }
  };

  const getLanguage = useCallback(async () => {
    try {
      const storedLanguage = await getStorageItem(PREFERRED_LANGUAGE);
      console.log("Loaded stored language:", storedLanguage);
      setLanguage(storedLanguage || defaultLanguage);
    } catch {
      log("Error loading language context");
      return false;
    }
  }, [defaultLanguage]);

  const saveLanguageContext = useCallback(async (value: string) => {
    setLanguage(value);
    saveStorageItem(PREFERRED_LANGUAGE, value);
    changeLanguage(value)
      .then(async () => {
        await switchLanguage(value);
      })
      .catch(() => {
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
