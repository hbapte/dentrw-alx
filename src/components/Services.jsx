import { Fade } from "react-awesome-reveal"
import { Trans, useTranslation } from "react-i18next"

import Service1 from "./Images/beautiful-smile.jpg"
import Ortho from "./Images/braces.jpeg"
import Consultation from "./Images/consultation.jpg"
import Bridge from "./Images/crown.jpeg"
import Extraction from "./Images/extraction.jpg"
import Toothache from "./Images/inflamation.jpg"
import RootCanal from "./Images/rootcanal.jpeg"
import Xray from "./Images/xray.jpeg"

const SERVICE_ITEMS = [
  { key: "cleaning", image: Service1 },
  { key: "xray", image: Xray },
  { key: "orthodontic", image: Ortho },
  { key: "bridge", image: Bridge },
  { key: "toothache", image: Toothache },
  { key: "extraction", image: Extraction },
  { key: "rootCanal", image: RootCanal },
  { key: "consultation", image: Consultation },
]

const Services = () => {
  const { t } = useTranslation("services")

  return (
    <section className="px-5 " id="service">
      <div className=" ">
        <header className="">
          <Fade>
            <div className="max-w-xl mb-10 md:mx-auto sm:text-center lg:max-w-2xl md:mb-12">
              <div>
                <p className="inline-block px-3 py-px mb-4 text-xs font-semibold tracking-wider text-teal-900 uppercase rounded-full bg-teal-accent-400">
                  {t("eyebrow")}
                </p>
              </div>
              <h2 className="relative max-w-[40rem] mb-6 font-sans text-3xl font-bold leading-none tracking-tight text-gray-900 sm:text-4xl md:mx-auto">
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
                    i18nKey="services:headline"
                    components={{ hl: <span className="text-blue-500" /> }}
                  />
                </span>
              </h2>

              <p className="max-w-[40rem] text-md mx-auto mt-4 text-gray-500">
                {t("subhead")}
              </p>
            </div>
          </Fade>
        </header>

        <ul className="grid gap-4 h-30 mt-6 sm:grid-cols-2   lg:grid-cols-4 ">
          {SERVICE_ITEMS.map(({ key, image }) => (
            <Fade key={key}>
              <li className="bg-slate-200">
                <img src={image} alt="" />
                <div className="relative py-2">
                  <h3 className="text-m text-center text-gray-700 group-hover:underline group-hover:underline-offset-4">
                    {t(`items.${key}`)}
                  </h3>
                </div>
              </li>
            </Fade>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default Services
