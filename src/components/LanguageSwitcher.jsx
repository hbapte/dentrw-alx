import { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"

import { SUPPORTED_LANGUAGES } from "../i18n"

// Inline SVGs so the flags render identically on every OS — Windows ships no
// emoji flag glyphs and would show "GB" / "FR" as letters instead.
// Both use a 3:2 viewBox so they share a baseline. The hairline ring keeps the
// white areas from disappearing against a white background.
const FLAG_CLASS = "h-3 w-[18px] shrink-0 rounded-[2px] ring-1 ring-black/10"

function FlagGB() {
  return (
    <svg viewBox="0 0 60 40" className={FLAG_CLASS} aria-hidden="true">
      <rect width="60" height="40" fill="#012169" />
      <path d="M0 0 60 40M60 0 0 40" stroke="#fff" strokeWidth="8" />
      <path d="M0 0 60 40M60 0 0 40" stroke="#c8102e" strokeWidth="4" />
      <path d="M30 0v40M0 20h60" stroke="#fff" strokeWidth="13" />
      <path d="M30 0v40M0 20h60" stroke="#c8102e" strokeWidth="8" />
    </svg>
  )
}

function FlagFR() {
  return (
    <svg viewBox="0 0 60 40" className={FLAG_CLASS} aria-hidden="true">
      <rect width="20" height="40" fill="#002395" />
      <rect x="20" width="20" height="40" fill="#fff" />
      <rect x="40" width="20" height="40" fill="#ed2939" />
    </svg>
  )
}

const FLAGS = { en: FlagGB, fr: FlagFR }

function GlobeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 shrink-0"
      aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 0 20 15.3 15.3 0 0 1 0-20" />
    </svg>
  )
}

function ChevronIcon({ open }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-3.5 w-3.5 shrink-0 transition-transform motion-reduce:transition-none ${
        open ? "rotate-180" : ""
      }`}
      aria-hidden="true">
      <path d="m18 15-6-6-6 6" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="ml-auto h-3.5 w-3.5 shrink-0 text-blue-600"
      aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

function PillSwitcher({ current, label, onSelect, nameOf }) {
  const activeIndex = Math.max(0, SUPPORTED_LANGUAGES.indexOf(current))

  return (
    <div
      role="group"
      aria-label={label}
      className="relative inline-flex items-center rounded-full bg-blue-50 p-0.5 ring-1 ring-blue-100">
      <span
        aria-hidden="true"
        className="absolute inset-y-0.5 left-0.5 w-[calc(50%-2px)] rounded-full bg-blue-600 shadow-sm transition-transform duration-200 ease-out motion-reduce:transition-none"
        style={{ transform: `translateX(${activeIndex * 100}%)` }}
      />
      {SUPPORTED_LANGUAGES.map((lng) => {
        const Flag = FLAGS[lng]
        const isActive = current === lng
        return (
          <button
            key={lng}
            type="button"
            onClick={() => onSelect(lng)}
            aria-label={nameOf(lng)}
            aria-pressed={isActive}
            className={`relative z-10 flex flex-1 items-center justify-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 motion-reduce:transition-none ${
              isActive ? "text-white" : "text-blue-900/70 hover:text-blue-900"
            }`}>
            {Flag ? <Flag /> : null}
            {lng}
          </button>
        )
      })}
    </div>
  )
}

function DropdownSwitcher({ current, label, onSelect, nameOf }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const triggerRef = useRef(null)

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
    }
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }

    document.addEventListener("mousedown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("mousedown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [open])

  const select = (lng) => {
    onSelect(lng)
    setOpen(false)
    triggerRef.current?.focus()
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-reduce:transition-none">
        <GlobeIcon />
        {nameOf(current)}
        <ChevronIcon open={open} />
      </button>

      {open && (
        <ul className="absolute bottom-full left-0 z-50 mb-2 min-w-full overflow-hidden rounded-lg bg-white py-1 shadow-lg ring-1 ring-black/5">
          {SUPPORTED_LANGUAGES.map((lng) => {
            const Flag = FLAGS[lng]
            const isActive = current === lng
            return (
              <li key={lng}>
                <button
                  type="button"
                  onClick={() => select(lng)}
                  aria-label={nameOf(lng)}
                  aria-current={isActive ? "true" : undefined}
                  className={`flex w-full items-center gap-2 whitespace-nowrap px-3 py-2 text-left text-sm transition-colors hover:bg-blue-50 focus-visible:bg-blue-50 focus-visible:outline-none motion-reduce:transition-none ${
                    isActive ? "font-semibold text-blue-900" : "text-gray-700"
                  }`}>
                  {Flag ? <Flag /> : null}
                  {nameOf(lng)}
                  {isActive ? <CheckIcon /> : null}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

const LanguageSwitcher = ({ variant = "pill" }) => {
  const { i18n, t } = useTranslation()
  const current = i18n.resolvedLanguage
  const label = t("language.label")
  const nameOf = (lng) => t(`language.${lng}`)
  const onSelect = (lng) => i18n.changeLanguage(lng)

  const props = { current, label, onSelect, nameOf }
  return variant === "dropdown" ? (
    <DropdownSwitcher {...props} />
  ) : (
    <PillSwitcher {...props} />
  )
}

export default LanguageSwitcher
