import { useEffect, useState } from "react"
import { Fade } from "react-awesome-reveal"

import { services } from "../../config/services.js"

const Contact = () => {
  const [isSent, setIsSent] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    let timeout
    if (error) {
      timeout = setTimeout(() => {
        setError("")
      }, 8000)
    }
    return () => clearTimeout(timeout)
  }, [error])

  const sendEmail = async (e) => {
    e.preventDefault()
    const formEl = e.currentTarget
    setIsLoading(true)
    setError("")

    try {
      const data = Object.fromEntries(new FormData(formEl))
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error(`Request failed: ${res.status}`)
      setIsSent(true)
      formEl.reset()
      setTimeout(() => {
        setIsSent(false)
      }, 5000)
    } catch {
      setError("An error occurred. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-(--breakpoint-lg) mx-auto p-2">
      <div className="grid grid-cols-1 md:grid-cols-12 border rounded-md">
        <div className="bg-slate-100 md:col-span-4 p-7 text-gray-900">
          <p className="mt-4 text-sm leading-7 font-regular uppercase">
            Contact
          </p>
          <h3 className="text-3xl sm:text-4xl leading-normal font-extrabold tracking-tight">
            Get In <span className="text-primary-500">Touch</span>
          </h3>
          <p className="mt-4 leading-6 text-gray-950">
            Book an appointment with our doctors, Our team is ready and waiting
            to serve you.
          </p>

          <p className="my-4 uppercase font-semibold border-b border-b-black pb-2">
            Clinic Hours
          </p>
          <p className="font-normal">
            Monday - Friday:{" "}
            <span className="font-semibold">06:00 - 17:00</span>
          </p>
          <p className="font-normal">
            Saturday: <span className="font-semibold">10:00 - 16:00</span>
          </p>
          <p className="mb-8">
            {" "}
            Sunday :<span className="font-semibold"> Closed</span>
          </p>

          <p className=" mt-3 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="#3b82f6"
              className="w-5 h-5 mr-2 sm:mr-3">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path>
            </svg>
            <span>+250727108418</span>
          </p>
          <p className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="#3b82f6"
              className="w-5 h-5 mr-2 sm:mr-3">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
            </svg>
            <span>ijbapte@gmail.com</span>
          </p>

          <p className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="#3b82f6"
              className="w-5 h-5 mr-2 sm:mr-3">
              <path
                fillRule="evenodd"
                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                clipRule="evenodd"></path>
            </svg>
            <span>KG 14 Ave - Remera, Rwanda</span>
          </p>
        </div>

        <form onSubmit={sendEmail} className="md:col-span-8 px-10 pt-4 pb-3">
          <input
            type="text"
            name="company"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="hidden"
            defaultValue=""
          />
          <div className="mb-3 " name="contact" id="contact">
            <label
              htmlFor="user_name"
              className="mb-1 block text-base font-medium text-[#07074D]">
              Full Name
            </label>
            <input
              type="text"
              name="user_name"
              id="user_name"
              placeholder="Full Name"
              className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-hidden focus:border-[#6A64F1] focus:shadow-md"
              required
            />
          </div>

          <div className="-mx-3 flex flex-wrap">
            <div className="w-full px-3 sm:w-1/2">
              <div className="mb-3">
                <label
                  htmlFor="user_phone"
                  className="mb-1 block text-base font-medium text-[#07074D]">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="user_phone"
                  id="user_phone"
                  placeholder="Enter your phone number"
                  className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-hidden focus:border-[#6A64F1] focus:shadow-md"
                  required
                />
              </div>
            </div>
            <div className="w-full px-3 sm:w-1/2">
              <div className="mb-3">
                <label
                  htmlFor="user_email"
                  className="mb-1 block text-base font-medium text-[#07074D]">
                  Email Address
                </label>
                <input
                  type="email"
                  name="user_email"
                  id="user_email"
                  placeholder="Enter your email"
                  className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-hidden focus:border-[#6A64F1] focus:shadow-md"
                  required
                />
              </div>
            </div>
          </div>

          <div className="mx-0 mb-3">
            <label
              htmlFor="chosen_service"
              className="mb-1 block text-base font-medium text-[#07074D]">
              Dental Services
            </label>
            <select
              name="chosen_service"
              id="chosen_service"
              className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-hidden focus:border-[#6A64F1] focus:shadow-md">
              {services.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div className="-mx-3 flex flex-wrap">
            <div className="w-full px-3 sm:w-1/2">
              <div className="mb-3">
                <label
                  htmlFor="user_date"
                  className="mb-1 block text-base font-medium text-[#07074D]">
                  Date
                </label>
                <input
                  type="date"
                  name="user_date"
                  id="user_date"
                  className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-hidden focus:border-[#6A64F1] focus:shadow-md"
                />
              </div>
            </div>
            <div className="w-full px-3 sm:w-1/2">
              <div className="mb-3">
                <label
                  htmlFor="user_time"
                  className="mb-1 block text-base font-medium text-[#07074D]">
                  Time
                </label>
                <input
                  type="time"
                  name="user_time"
                  id="user_time"
                  className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-hidden focus:border-[#6A64F1] focus:shadow-md"
                />
              </div>
            </div>
          </div>

          <div className="w-full mb-3">
            <label
              className="mb-1 block text-base font-medium text-[#07074D]"
              htmlFor="user_message">
              Doctor Note
            </label>
            <textarea
              id="user_message"
              name="user_message"
              rows="2"
              className="resize-none w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-hidden focus:border-[#6A64F1] focus:shadow-md"></textarea>
          </div>

          <div className="mt-4">
            <Fade>
              <button
                type="submit"
                value="Send"
                className="hover:shadow-form hover:opacity-90 w-full rounded-md bg-blue-600 py-3 px-8 text-center text-base font-semibold text-white outline-hidden"
                disabled={isLoading}>
                {isLoading ? "Booking..." : "Book Appointment"}
              </button>
            </Fade>
            {isSent && (
              <p className="text-green-500 mt-1 text-center">
                Appointment received successfully, Thank you!
              </p>
            )}
            {error && <p className="text-red-500 mt-1 text-center">{error}</p>}
          </div>
        </form>
      </div>
    </div>
  )
}

export default Contact
