import { initReactI18next } from "react-i18next";
import resourcesToBackend from "i18next-resources-to-backend";
import { getLocales } from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PREFERRED_LANGUAGE } from "./components/constants";
import i18next from "i18next";

export const initI18next = async () => {
  const storedLanguage = await AsyncStorage.getItem(PREFERRED_LANGUAGE);
  const initialLanguage = storedLanguage || getLocales()[0].languageTag || "en";

  await i18next
    .use(initReactI18next)
    .use(
      resourcesToBackend((language: string, namespace: string) =>
        getTranslations(language, namespace),
      ),
    )
    .on("failedLoading", (lng, ns, msg) =>
      console.log(`Failed to load ${ns} for ${lng}: ${msg}`),
    )
    .init({
      returnEmptyString: false, // allows empty string as valid translation
      lng: initialLanguage, // set initial language based on device settings
      fallbackLng: "en",
      defaultNS: "translation",
    });

  return i18next;
};

const locales: Record<string, Record<string, any>> = {
  en: {
    translation: require("./locales/en/translation.json"),
    auth: require("./locales/en/auth.json"),
    index: require("./locales/en/index.json"),
    about: require("./locales/en/about.json"),
    signin: require("./locales/en/signin.json"),
    signup: require("./locales/en/signup.json"),
  },
  es: {
    translation: require("./locales/es/translation.json"),
    auth: require("./locales/es/auth.json"),
    index: require("./locales/es/index.json"),
    about: require("./locales/es/about.json"),
    signin: require("./locales/es/signin.json"),
    signup: require("./locales/es/signup.json"),
  },
};

const getTranslations = (language: string, namespace: string) => {
  return locales[language]?.[namespace] ?? {};
};
