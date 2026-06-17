import React from "react";
import homepicture from "./Images/home.png";
import { Fade } from "react-awesome-reveal";
import { Link } from "react-scroll";

const Hero = () => {
  return (
    <main>
      <div class="" name="home">
        <div class="mx-auto h-full px-4 py-10 sm:max-w-xl md:max-w-full md:px-24 md:py-36 lg:px-8">
          <div class="flex flex-col items-center justify-between lg:flex-row">
            <div class="">
              <div class="lg:max-w-xl lg:pr-5">
                <h2 class="md:mt-0 mt-24  mb-6 max-w-lg text-5xl font-light leading-snug tracking-tight text-blue-600 sm:text-8xl">
                  Meet your <br />
                  <span class="my-1 inline-block border-b-8 border-blue-600 font-bold text-blue-600">
                    {" "}
                    Dentist{" "}
                  </span>
                </h2>

                <p class="text-base text-gray-700">
                  Harmonizing Oral health and creating beautiful smiles.
                  Bringing confidence and wellness to your life through modern
                  dental care!
                </p>
              </div>
              <div class="mt-10 flex flex-col items-center md:flex-row">
                <Link
                  to="contact"
                  smooth={true}
                  duration={500}
                  offset={-100}
                  className="mb-3 inline-flex h-12 w-full items-center justify-center rounded bg-blue-700 px-6 font-medium tracking-wide text-white shadow-md transition duration-200 md:mr-4 md:mb-0 md:w-auto focus:outline-none hover:bg-blue-800"
                >
                  Book Appointment
                </Link>
                <Link
                  to="service"
                  smooth={true}
                  duration={500}
                  offset={-100}
                  className="underline-offset-2 inline-flex items-center text-xl font-bold text-blue-600 underline transition-colors duration-200 hover:underline"
                >
                  Get Started
                </Link>
              </div>
              <div class="mt-12 flex flex-col space-y-3 divide-gray-300 text-sm text-gray-700 sm:flex-row sm:space-y-0 sm:divide-x">
                <div class="flex max-w-xs space-x-2 px-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-12 w-12 text-emerald-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                  <p>
                    We are dedicated to providing comprehensive, quality dental
                    care
                  </p>
                </div>
                <div class="flex max-w-xs space-x-2 px-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-12 w-12 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                    />
                  </svg>
                  <p> Leading dental clinic in Kigali, Rwanda</p>
                </div>
              </div>
            </div>
            <div class="relative hidden lg:ml-32 lg:block lg:w-1/2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="mx-auto my-6 h-10 w-10 animate-bounce rounded-full bg-blue-50 p-2 lg:hidden"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M16 17l-4 4m0 0l-4-4m4 4V3"
                />
              </svg>
              <div class="w-fit rounded-[6rem] mx-auto overflow-hidden rounded-tl-none rounded-br-none bg-blue-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="absolute -left-10 -top-20 h-28 w-28 rounded-xl bg-white text-gray-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  />
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="absolute right-0 -bottom-20 h-28 w-28 rounded-xl bg-white text-gray-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z"
                    clip-rule="evenodd"
                  />
                </svg>
                <Fade>
                  <img class="-mb-20" src={homepicture} alt="hero portrait" />
                </Fade>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Hero;
