import { Fade } from "react-awesome-reveal"
import { Trans, useTranslation } from "react-i18next"

import BK from "./Images/insurance/BK.png"
import BRITAM from "./Images/insurance/britam.png"
import MMI from "./Images/insurance/mmi.png"
import PRIME from "./Images/insurance/prime.png"
import RADIANT from "./Images/insurance/radiant.png"
import RSSB from "./Images/insurance/rssb.png"
import SANLAM from "./Images/insurance/sanlam.png"
import SORAS from "./Images/insurance/Soras.png"

const LOGOS = [
  { src: RSSB, alt: "RSSB" },
  { src: SANLAM, alt: "Sanlam" },
  { src: MMI, alt: "MMI" },
  { src: BRITAM, alt: "Britam" },
  { src: SORAS, alt: "SORAS" },
  { src: PRIME, alt: "Prime Insurance" },
  { src: RADIANT, alt: "Radiant" },
  { src: BK, alt: "BK" },
]

const Insurance = () => {
  const { t } = useTranslation("insurance")

  return (
    <section className="mt-16" id="insurance">
      <Fade>
        <div className="mx-4 mb-10 max-w-xl sm:text-center md:mx-auto md:mb-12 lg:max-w-2xl">
          <p className="mb-4 inline-block rounded-full bg-teal-accent-400 px-3 py-px text-xs font-semibold uppercase tracking-wider text-teal-900">
            {t("eyebrow")}
          </p>
          <h2 className="relative mb-6 max-w-md font-sans text-2xl font-bold leading-none tracking-tight text-gray-900 sm:text-4xl md:mx-auto md:text-3xl">
            <span className="relative">
              <Trans
                i18nKey="insurance:headline"
                components={{ hl: <span className="text-blue-500" /> }}
              />
            </span>
          </h2>
        </div>
      </Fade>

      <Fade>
        <div className="mx-auto grid max-w-5xl grid-cols-2 items-center gap-x-8 gap-y-10 px-4 sm:grid-cols-4 md:px-8">
          {LOGOS.map(({ src, alt }) => (
            <img
              key={alt}
              src={src}
              alt={alt}
              loading="lazy"
              className="mx-auto h-13 w-auto max-w-full object-contain sm:h-16"
            />
          ))}
        </div>
      </Fade>
    </section>
  )
}

export default Insurance
