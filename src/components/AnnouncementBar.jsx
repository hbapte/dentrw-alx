import { useLayoutEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"

const ANNOUNCEMENT_ID = "v4-launch" // bump this when the message changes
const STORAGE_KEY = "dentrw:announcement"

function readDismissed() {
  try {
    return localStorage.getItem(STORAGE_KEY) === ANNOUNCEMENT_ID
  } catch {
    return false
  }
}

const AnnouncementBar = () => {
  const { t } = useTranslation()
  const [dismissed, setDismissed] = useState(readDismissed)
  const barRef = useRef(null)

  useLayoutEffect(() => {
    const root = document.documentElement
    if (dismissed) {
      root.style.setProperty("--announcement-height", "0px")
      return
    }
    const el = barRef.current
    if (!el) return

    const measure = () =>
      root.style.setProperty("--announcement-height", `${el.offsetHeight}px`)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)

    return () => {
      observer.disconnect()
      root.style.setProperty("--announcement-height", "0px")
    }
  }, [dismissed])

  if (dismissed) return null

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, ANNOUNCEMENT_ID)
    } catch {
      // storage unavailable (private mode, disabled) — dismiss for this session only
    }
    setDismissed(true)
  }

  return (
    <div
      ref={barRef}
      className="fixed left-0 top-0 z-50 w-full animate-[announcement-slide-down_200ms_ease-out] bg-gradient-to-r from-blue-600 to-blue-700 text-white motion-reduce:animate-none">
      <div className="relative flex items-center justify-center gap-x-2 px-10 py-2 text-center text-sm">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4 shrink-0"
          aria-hidden="true">
          <path d="m3 11 18-5v12L3 14v-3z" />
          <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
        </svg>
        <span>
          {t("announcement.message")}{" "}
          <a
            href="https://dentrw.hbapte.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold underline transition-colors hover:text-blue-200">
            {t("announcement.cta")} &rarr;
          </a>
        </span>
        <button
          type="button"
          onClick={dismiss}
          aria-label={t("announcement.dismiss")}
          className="absolute right-1 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
            aria-hidden="true">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default AnnouncementBar
