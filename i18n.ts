import { initReactI18next } from "react-i18next";
import resourcesToBackend from "i18next-resources-to-backend";
import { getLocales } from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PREFERRED_LANGUAGE } from "./components/constants";
import i18next from "i18next";

export const initI18next = async () => {
  const storedLanguage = await AsyncStorage.getItem(PREFERRED_LANGUAGE);
  const initialLanguage = storedLanguage || getLocales()[0].languageCode || "en";

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
      returnEmptyString: false, // treat empty strings as missing translations so fallback behavior applies
      lng: initialLanguage, // set initial language based on device settings
      fallbackLng: "en",
      defaultNS: "translation",
      ns: [
        "translation",
        "auth",
        "index",
        "about",
        "signin",
        "signup",
        "forgot",
        "sightingpage",
        "petprofile",
        "sightingdetails",
        "settings",
        "dialog",
        "privacy",
        "terms",
        "wizard",
        "owner",
      ],
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
    forgot: require("./locales/en/forgot.json"),
    sightingpage: require("./locales/en/sightingpage.json"),
    petprofile: require("./locales/en/petprofile.json"),
    sightingdetails: require("./locales/en/sightingdetails.json"),
    settings: require("./locales/en/settings.json"),
    dialog: require("./locales/en/dialog.json"),
    privacy: require("./locales/en/privacy.json"),
    terms: require("./locales/en/terms.json"),
    wizard: require("./locales/en/wizard.json"),
    owner: require("./locales/en/owner.json"),
  },
  es: {
    translation: require("./locales/es/translation.json"),
    auth: require("./locales/es/auth.json"),
    index: require("./locales/es/index.json"),
    about: require("./locales/es/about.json"),
    signin: require("./locales/es/signin.json"),
    signup: require("./locales/es/signup.json"),
    forgot: require("./locales/es/forgot.json"),
    sightingpage: require("./locales/es/sightingpage.json"),
    petprofile: require("./locales/es/petprofile.json"),
    sightingdetails: require("./locales/es/sightingdetails.json"),
    settings: require("./locales/es/settings.json"),
    dialog: require("./locales/es/dialog.json"),
    privacy: require("./locales/es/privacy.json"),
    terms: require("./locales/es/terms.json"),
    wizard: require("./locales/es/wizard.json"),
    owner: require("./locales/es/owner.json"),
  },
};

const getTranslations = (language: string, namespace: string) => {
  return locales[language]?.[namespace] ?? {};
};
