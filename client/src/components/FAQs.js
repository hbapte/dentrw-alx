import React from "react";
import { Fade } from "react-awesome-reveal";

const FAQs = () => {
  return (
    <section className="bg-white pb-7 text-slate-900">
      <div className="container  flex flex-col justify-center p-3 mx-auto md:p-8">
        <Fade>
          <h2 className="mb-10 mt-10 text-3xl font-bold leading-none text-center sm:mx-4">
            {" "}
            Frequently Asked Questions
          </h2>
        </Fade>
        <div className="flex flex-col divide-y divide-gray-300 sm:mx-12 lg:px-12 xl:px-32 mb-10">
          <Fade>
            <details>
              <summary className="py-2 outline-none cursor-pointer focus:font-semibold">
                {" "}
                What Services does DentRw offer?
              </summary>

              <div className="px-4 pb-4">
                <p>
                  {" "}
                  DentRw offers a wide range of dental services, including
                  preventative care, virtual consultation, cleanings, fillings,
                  root canals, extractions and more. Our Experienced team is
                  dedicated to providing exceptional oral health care to our
                  patients
                </p>
              </div>
            </details>
          </Fade>
          <Fade>
            <details>
              <summary className="py-2 outline-none cursor-pointer focus:font-semibold">
                {" "}
                What are the effects of taditional habit known as Gukura
                Ibyinyo/Tooth bud extraction?{" "}
              </summary>
              <div>
                <p className="px-4 pb-4">
                  It's important to note that tooth bud extraction can have
                  serious and detrimental effects on oral health. The tooth buds
                  are the immature teeth that are still developing beneath the
                  gums in children. Removing these tooth buds interferes with
                  the natural eruption and alignment of permanent teeth, leading
                  to various dental issues.
                </p>
                <p className="px-4 pb-4">
                  Some potential effects of tooth bud extraction include:
                  Misalignment of Teeth, Impacted Teeth, Bite Problems
                  ,Psychological Impact. It's essential to prioritize
                  evidence-based dental care practices.
                </p>
              </div>
            </details>
          </Fade>
          <Fade>
            <details>
              <summary className="py-2 outline-none cursor-pointer focus:font-semibold">
                {" "}
                How do I schedule an appointment at DentRw ?{" "}
              </summary>
              <div>
                <p className="px-4 pb-4">
                  {" "}
                  To schedule appointment at DentRw simpy fill below form and
                  submit.
                </p>
                <p className="px-4 pb-4">
                  {" "}
                  Besides our online booking system, you can also give us a
                  call. We offer flexible scheduling options to ensure that you
                  can receive the care you need at a time that works for you.
                </p>
              </div>
            </details>
          </Fade>
        </div>
      </div>
    </section>
  );
};

export default FAQs;
