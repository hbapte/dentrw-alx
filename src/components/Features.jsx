import { Fade } from "react-awesome-reveal"
import { useTranslation } from "react-i18next"

const CARD_KEYS = [
  "virtualConsultation",
  "onlineBooking",
  "preventiveCare",
  "physicalTreatment",
]

const Features = () => {
  const { t } = useTranslation("features")

  return (
    <div className="px-4 py-16 mx-auto sm:max-w-xl md:max-w-full lg:max-w-(--breakpoint-xl) md:px-24 lg:px-8 lg:py-20">
      <div className="max-w-xl mb-10 md:mx-auto sm:text-center lg:max-w-2xl md:mb-12">
        <div>
          <p className="inline-block px-3 py-px mb-4 text-xs font-semibold tracking-wider text-teal-900 uppercase rounded-full bg-teal-accent-400">
            {t("eyebrow")}
          </p>
        </div>
        <Fade>
          <h2 className="relative max-w-lg mb-6 font-sans text-3xl font-bold leading-none tracking-tight text-gray-900 sm:text-4xl md:mx-auto">
            <svg
              viewBox="0 0 52 24"
              fill="currentColor"
              className="absolute top-0 left-0 z-0 hidden w-32 -mt-8 -ml-20 text-blue-gray-100 lg:w-32 lg:-ml-28 lg:-mt-10 sm:block">
              <defs>
                <pattern
                  id="18302e52-9e2a-4c8e-9550-0cbb21b38e55"
                  x="0"
                  y="0"
                  width=".135"
                  height=".30">
                  <circle cx="1" cy="1" r=".7" />
                </pattern>
              </defs>
              <rect
                fill="url(#18302e52-9e2a-4c8e-9550-0cbb21b38e55)"
                width="52"
                height="24"
              />
            </svg>
            <span className="relative">{t("headline")}</span>
          </h2>
        </Fade>
        <Fade>
          <p className="text-base text-gray-700 md:text-lg">{t("subhead")}</p>
        </Fade>
      </div>

      <div className="grid gap-4 row-gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {CARD_KEYS.map((key) => (
          <Fade key={key}>
            <div className="flex flex-col justify-between p-5 border rounded-sm shadow-xs">
              <div>
                <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-indigo-50">
                  <svg
                    className="w-12 h-12 text-deep-purple-accent-400"
                    stroke="currentColor"
                    viewBox="0 0 52 52">
                    <polygon
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                      points="29 13 14 29 25 29 23 39 38 23 27 23"
                    />
                  </svg>
                </div>
                <h6 className="mb-2 font-semibold leading-5">
                  {t(`cards.${key}.title`)}
                </h6>
                <p className="mb-3 text-sm text-gray-900">
                  {t(`cards.${key}.description`)}
                </p>
              </div>
              <a
                href="/"
                aria-label=""
                className="inline-flex items-center font-semibold transition-colors duration-200 text-blue-800 hover:text-blue-500">
                {t("learnMore")}
              </a>
            </div>
          </Fade>
        ))}
      </div>
    </div>
  )
}

export default Features
