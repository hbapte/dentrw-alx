import { Fade } from "react-awesome-reveal"
import { useTranslation } from "react-i18next"

const FAQs = () => {
  const { t } = useTranslation("faqs")
  const items = t("items", { returnObjects: true })

  return (
    <section className="bg-white pb-7 text-slate-900">
      <div className="container  flex flex-col justify-center p-3 mx-auto md:p-8">
        <Fade>
          <h2 className="mb-10 mt-10 text-3xl font-bold leading-none text-center sm:mx-4">
            {t("title")}
          </h2>
        </Fade>
        <div className="flex flex-col divide-y divide-gray-300 sm:mx-12 lg:px-12 xl:px-32 mb-10">
          {items.map((item, i) => (
            <Fade key={i}>
              <details>
                <summary className="py-2 outline-hidden cursor-pointer focus:font-semibold">
                  {item.question}
                </summary>
                <div>
                  {item.answers.map((paragraph, j) => (
                    <p key={j} className="px-4 pb-4">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </details>
            </Fade>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FAQs
