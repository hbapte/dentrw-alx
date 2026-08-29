import { useTranslation } from "react-i18next"

import { SUPPORTED_LANGUAGES } from "../i18n"

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation()
  const current = i18n.resolvedLanguage

  return (
    <div
      className="flex items-center gap-1"
      role="group"
      aria-label={t("language.label")}>
      {SUPPORTED_LANGUAGES.map((lng) => (
        <button
          key={lng}
          type="button"
          onClick={() => i18n.changeLanguage(lng)}
          aria-current={current === lng ? "true" : undefined}
          className={
            "rounded-sm px-2 py-1 text-xs font-semibold uppercase transition-colors " +
            (current === lng
              ? "bg-blue-600 text-white"
              : "text-blue-900 hover:bg-blue-50")
          }>
          {lng}
        </button>
      ))}
    </div>
  )
}

export default LanguageSwitcher
