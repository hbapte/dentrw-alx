import { Fade } from "react-awesome-reveal"
import { Trans, useTranslation } from "react-i18next"

import Arriana from "./Images/arriana.png"
import Chance from "./Images/chance.png"
import Gateme from "./Images/gateme.png"
import Theodat from "./Images/theodat.png"

const TEAM = [
  { name: "GATEME Gaby", image: Gateme, roleKey: "orthodontist" },
  { name: "MAHORO Eunice", image: Chance, roleKey: "therapist" },
  { name: "IBAKA M. Theodat", image: Theodat, roleKey: "dentalSurgeon" },
  { name: "DUKUNDE Arriana", image: Arriana, roleKey: "assistant" },
]

const Team = () => {
  const { t } = useTranslation("team")

  return (
    <section className="mt-16  bg-slate-100 " id="team">
      <div className="container px-6 py-12 mx-auto">
        <Fade>
          <header className="">
            <div className="max-w-xl mb-10 md:mx-auto sm:text-center lg:max-w-2xl md:mb-12">
              <div>
                <p className="inline-block px-3 py-px mb-4 text-xs font-semibold tracking-wider text-teal-900 uppercase rounded-full bg-teal-accent-400">
                  {t("eyebrow")}
                </p>
              </div>
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
                <span className="relative">
                  <Trans
                    i18nKey="team:headline"
                    components={{ hl: <span className="text-blue-500" /> }}
                  />
                </span>
              </h2>

              <p className="max-w-172 text-md mx-auto mt-4 text-gray-600">
                {t("subhead")}{" "}
                <span className=" hidden lg:inline">{t("subheadExtra")}</span>
              </p>
            </div>
          </header>
        </Fade>

        <div className="grid gap-8 mt-12  md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
          {TEAM.map(({ name, image, roleKey }) => (
            <div key={name} className="w-full max-w-xs text-center">
              <img
                className="object-cover object-center w-full h-60 mx-auto rounded-lg"
                src={image}
                alt={name}
              />

              <div className="mt-2">
                <h3 className="text-md font-bold text-gray-700">{name}</h3>
                <span className="mt-1 font-medium text-gray-600 ">
                  {t(`roles.${roleKey}`)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Team
