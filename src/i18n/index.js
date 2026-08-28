import i18n from "i18next"
import LanguageDetector from "i18next-browser-languagedetector"
import { initReactI18next } from "react-i18next"

import enCommon from "./locales/en/common.json"
import frCommon from "./locales/fr/common.json"

export const SUPPORTED_LANGUAGES = ["en", "fr"]

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { common: enCommon },
      fr: { common: frCommon },
    },
    fallbackLng: "en",
    supportedLngs: SUPPORTED_LANGUAGES,
    // Treat region variants (e.g. "en-US", "fr-FR") as their base language
    // so the browser's preferred language is matched correctly.
    load: "languageOnly",
    nonExplicitSupportedLngs: true,
    defaultNS: "common",
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  })

// Keep <html lang> in sync with the active language.
const applyHtmlLang = (lng) => {
  if (typeof document !== "undefined") {
    document.documentElement.lang = lng
  }
}
applyHtmlLang(i18n.resolvedLanguage || "en")
i18n.on("languageChanged", applyHtmlLang)

export default i18n
