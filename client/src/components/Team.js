import React from "react";
import Arriana from "./Images/arriana.png";
import Chance from "./Images/chance.png";
import Gateme from "./Images/gateme.png";
import Theodat from "./Images/theodat.png";
import { Fade } from "react-awesome-reveal";

const Team = () => {
  return (
    <section class="mt-16  bg-slate-100 " id="team">
      <div class="container px-6 py-12 mx-auto">
        <Fade>
          <header class="">
            <div className="max-w-xl mb-10 md:mx-auto sm:text-center lg:max-w-2xl md:mb-12">
              <div>
                <p className="inline-block px-3 py-px mb-4 text-xs font-semibold tracking-wider text-teal-900 uppercase rounded-full bg-teal-accent-400">
                  Team
                </p>
              </div>
              <h2 className="max-w-lg mb-6 font-sans text-3xl font-bold leading-none tracking-tight text-gray-900 sm:text-4xl md:mx-auto">
                <span className="relative inline-block">
                  <svg
                    viewBox="0 0 52 24"
                    fill="currentColor"
                    className="absolute top-0 left-0 z-0 hidden w-32 -mt-8 -ml-20 text-blue-gray-100 lg:w-32 lg:-ml-28 lg:-mt-10 sm:block"
                  >
                    <defs>
                      <pattern
                        id="18302e52-9e2a-4c8e-9550-0cbb21b38e55"
                        x="0"
                        y="0"
                        width=".135"
                        height=".30"
                      >
                        <circle cx="1" cy="1" r=".7" />
                      </pattern>
                    </defs>
                    <rect
                      fill="url(#18302e52-9e2a-4c8e-9550-0cbb21b38e55)"
                      width="52"
                      height="24"
                    />
                  </svg>
                  <span className="relative"> Meet </span>
                </span>{" "}
                Our Expert <span className="text-blue-500"> Team </span>
              </h2>

              <p class="max-w-[43rem] text-md mx-auto mt-4 text-gray-600">
                Our dedicated team of dental professionals is committed to
                providing you with the best dental care possible.{" "}
                <span className=" hidden lg:inline">
                  Each member of our team is highly skilled and experienced in
                  their respective areas of expertise, ensuring that you receive
                  personalized and high-quality treatment.
                </span>
              </p>
            </div>
          </header>
        </Fade>

        <div class="grid gap-8 mt-12 grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
          <div class="w-full max-w-xs text-center">
            <img
              class="object-cover object-center w-full h-60 mx-auto rounded-lg"
              src={Gateme}
              alt="avatar"
            />

            <div class="mt-2">
              <h3 class="text-md font-bold text-gray-700">GATEME Gaby </h3>
              <span class="mt-1 font-medium text-gray-600 ">Orthodontist</span>
            </div>
          </div>

          <div class="w-full max-w-xs text-center">
            <img
              class="object-cover object-center w-full h-60 mx-auto rounded-lg"
              src={Chance}
              alt="avatar"
            />

            <div class="mt-2">
              <h3 class="text-md font-bold text-gray-700 ">MAHORO Eunice</h3>
              <span class="mt-1 font-medium text-gray-600 ">Therapist</span>
            </div>
          </div>

          <div class="w-full max-w-xs text-center">
            <img
              class="object-cover object-center w-full  h-60 mx-auto rounded-lg"
              src={Theodat}
              alt="avatar"
            />

            <div class="mt-2">
              <h3 class="text-md font-bold text-gray-700 ">IBAKA M. Theodat</h3>
              <span class="mt-1 font-medium text-gray-600 ">
                Dental Surgeon
              </span>
            </div>
          </div>

          <div class="w-full max-w-xs text-center">
            <img
              class="object-cover object-center w-full h-60 mx-auto rounded-lg"
              src={Arriana}
              alt="avatar"
            />

            <div class="mt-2">
              <h3 class="text-md font-bold text-gray-700 ">DUKUNDE Arriana</h3>
              <span class="mt-1 font-medium text-gray-600 ">Assistant</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Team;
