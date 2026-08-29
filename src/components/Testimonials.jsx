import { Fade } from "react-awesome-reveal"
import { Autoplay, Navigation, Pagination } from "swiper"
import { Swiper, SwiperSlide } from "swiper/react"

import { testimonials } from "./testimonials.data"

import "swiper/css"
import "swiper/css/pagination"
import "swiper/css/navigation"

const STAR_PATHS = {
  full: {
    viewBox: "0 0 576 512",
    d: "M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z",
  },
  half: {
    viewBox: "0 0 536 512",
    d: "M508.55 171.51L362.18 150.2 296.77 17.81C290.89 5.98 279.42 0 267.95 0c-11.4 0-22.79 5.9-28.69 17.81l-65.43 132.38-146.38 21.29c-26.25 3.8-36.77 36.09-17.74 54.59l105.89 103-25.06 145.48C86.98 495.33 103.57 512 122.15 512c4.93 0 10-1.17 14.87-3.75l130.95-68.68 130.94 68.7c4.86 2.55 9.92 3.71 14.83 3.71 18.6 0 35.22-16.61 31.66-37.4l-25.03-145.49 105.91-102.98c19.04-18.5 8.52-50.8-17.73-54.6zm-121.74 123.2l-18.12 17.62 4.28 24.88 19.52 113.45-102.13-53.59-22.38-11.74.03-317.19 51.03 103.29 11.18 22.63 25.01 3.64 114.23 16.63-82.65 80.38z",
  },
  empty: {
    viewBox: "0 0 576 512",
    d: "M528.1 171.5L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6zM388.6 312.3l23.7 138.4L288 385.4l-124.3 65.3 23.7-138.4-100.6-98 139-20.2 62.2-126 62.2 126 139 20.2-100.6 98z",
  },
}

const QUOTE_ICON =
  "M464 256h-80v-64c0-35.3 28.7-64 64-64h8c13.3 0 24-10.7 24-24V56c0-13.3-10.7-24-24-24h-8c-88.4 0-160 71.6-160 160v240c0 26.5 21.5 48 48 48h128c26.5 0 48-21.5 48-48V304c0-26.5-21.5-48-48-48zm-288 0H96v-64c0-35.3 28.7-64 64-64h8c13.3 0 24-10.7 24-24V56c0-13.3-10.7-24-24-24h-8C71.6 32 0 103.6 0 192v240c0 26.5 21.5 48 48 48h128c26.5 0 48-21.5 48-48V304c0-26.5-21.5-48-48-48z"

function StarRating({ rating }) {
  return (
    <ul
      className="flex justify-center mb-6"
      aria-label={`Rated ${rating} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => {
        const position = i + 1
        let variant = "empty"
        if (rating >= position) variant = "full"
        else if (rating >= position - 0.5) variant = "half"
        const star = STAR_PATHS[variant]
        return (
          <li key={i}>
            <svg
              aria-hidden="true"
              className="w-4 text-yellow-500"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox={star.viewBox}>
              <path fill="currentColor" d={star.d} />
            </svg>
          </li>
        )
      })}
    </ul>
  )
}

function TestimonialCard({ name, role, quote, rating, image }) {
  return (
    <div className="my-auto carousel-item active relative float-left w-full">
      <img
        className="rounded-full shadow-lg mb-6 mt-6  w-24 mx-auto"
        src={image}
        alt={name}
      />
      <div className="flex my-auto flex-wrap justify-center">
        <div className="grow-0 shrink-0  basis-auto w-full lg:w-8/12 px-3">
          <h5 className="text-center text-lg font-bold mb-3">{name}</h5>
          <p className="text-center font-semibold text-gray-700 mb-4">{role}</p>
          <p className="text-gray-600 mb-12">
            <svg
              aria-hidden="true"
              className="w-6 pr-2 inline-block"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512">
              <path fill="currentColor" d={QUOTE_ICON} />
            </svg>
            {quote}
          </p>
          <StarRating rating={rating} />
        </div>
      </div>
    </div>
  )
}

const NAV_ARROW = "M9 5l7 7-7 7"

export default function Testimonials() {
  return (
    <div className="container mx-auto p-6 mt-1" id="app">
      <Fade>
        <header>
          <div className="max-w-xl mb-0 mx-auto sm:text-center lg:max-w-2xl md:mb-12">
            <div>
              <p className="inline-block px-3 py-px mb-4 text-xs font-semibold tracking-wider text-teal-900 uppercase rounded-full bg-teal-accent-400">
                Testimonials
              </p>
            </div>
            <h2 className="max-w-lg mb-0 font-sans text-3xl font-bold leading-none tracking-tight text-gray-900 sm:text-4xl md:mx-auto">
              <span className="relative inline-block">
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
                <span className="relative">Read </span>
              </span>{" "}
              reviews from Our{" "}
              <span className="text-blue-500 relative">Patients</span>
            </h2>

            <p className="max-w-160 text-md mx-auto mt-4 text-gray-500"></p>
          </div>
        </header>
      </Fade>

      <Swiper
        loop={true}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
        }}
        slidesPerView={1}
        spaceBetween={10}
        pagination={{
          clickable: true,
        }}
        navigation={{
          nextEl: ".next-button",
          prevEl: ".prev-button",
        }}
        modules={[Autoplay, Pagination, Navigation]}
        breakpoints={{
          768: {
            slidesPerView: 2,
            spaceBetween: 20,
          },
          1524: {
            slidesPerView: 3,
            spaceBetween: 30,
          },
        }}>
        {testimonials.map((testimonial) => (
          <SwiperSlide
            key={testimonial.name}
            className="flex rounded-[4px] my-10 justify-center items-center bg-slate-100">
            <TestimonialCard {...testimonial} />
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="mt-1 flex justify-center items-center gap-4">
        <button
          aria-label="Previous slide"
          className="prev-button rounded-full border border-blue-600 p-2 text-blue-600 hover:bg-blue-500 hover:text-white">
          <svg
            className="h-5 w-5 -rotate-180 transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg">
            <path
              d={NAV_ARROW}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
        </button>

        <button
          aria-label="Next slide"
          className="next-button rounded-full border border-blue-600 p-2 text-blue-600 hover:bg-blue-500 hover:text-white">
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg">
            <path
              d={NAV_ARROW}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}
