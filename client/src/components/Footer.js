import React, { useState } from "react";
import axios from "axios";
import { Fade } from "react-awesome-reveal";
// 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

const Footer = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Reset  error message
    setErrorMessage("");

    // Validation of email input
    if (!email) {
      setErrorMessage("Email is required.");
      return;
    }

    // ConvertKit API key and form ID
    const API_KEY = "YW9GegPZXKzE53M7vqmLvw";
    const FORM_ID = "5258337";

    setLoading(true);

    try {
      const response = await axios.post(
        `https://api.convertkit.com/v3/forms/${FORM_ID}/subscribe`,
        {
          api_key: API_KEY,
          email,
        }
      );
      console.log("Email sent successfully!");
      setEmail(""); // Resetting the email input field after successful submission
      setLoading(false);
      setSubscribed(true);

      setTimeout(() => {
        setSubscribed(false);
      }, 3000);
    } catch (error) {
      console.error("Error sending email:", error);
      setErrorMessage("Error occurred. Please try again!");
      setLoading(false);

      setTimeout(() => {
        setErrorMessage("");
      }, 3000);
    }
  };

  return (
    <footer className="px-4  bg-slate-900 text-white">
      <div className="mt-6 pt-6 flex ">
        <div class="mb-4 ">
          <h2 class="text-xl font-bold text-slate-100">
            Subscribe to our newsletter!
          </h2>
        </div>
      </div>
      <div className="py-2 grid lg:grid-cols-2 gap-7 items-center">
        <div>
          <p className="text-sm text-gray-400">
            Subscribe and be the first to know about the latest oral health
            tips, special offers, events, and discounts in your inbox.
          </p>
        </div>
        <div>
          <form onSubmit={handleSubmit} className="flex">
            <label htmlFor="EMAIL" className="sr-only">
              Email
            </label>
            <div className="flex-1 mr-4 sm:mr-0">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={handleEmailChange}
                  className="block w-full px-4 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent sm:text-sm"
                />
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-700 sm:ml-1 hover:bg-blue-400 text-white font-semibold py-2 px-4 rounded"
            >
              {loading ? "Subscribing..." : "Subscribe"}
            </button>
          </form>
          {errorMessage && (
            <p className="text-red-500 text-xs">{errorMessage}</p>
          )}
          {subscribed && (
            <p className="text-green-500 mt-2 text-xs">
              Subscribed successfully!
            </p>
          )}
        </div>
      </div>

      <div className="container  flex flex-col justify-between py-10 mx-auto space-y-8 lg:flex-row lg:space-y-0">
        <div className="lg:w-1/3">
          <a
            rel="noopener noreferrer"
            href="/"
            className="flex justify-center space-x-2 lg:justify-start"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="30"
                height="30"
                fill="none"
              >
                <path
                  d="M9.19807 4.45825C8.55418 4.22291 7.94427 4 7 4C5 4 4 6 4 8.5C4 10.0985 4.40885 11.0838 4.83441 12.1093C5.0744 12.6877 5.31971 13.2788 5.5 14C5.649 14.596 5.7092 15.4584 5.77321 16.3755C5.92401 18.536 6.096 21 7.5 21C8.39898 21 8.79286 19.5857 9.22652 18.0286C9.75765 16.1214 10.3485 14 12 14C13.6515 14 14.2423 16.1214 14.7735 18.0286C15.2071 19.5857 15.601 21 16.5 21C17.904 21 18.076 18.536 18.2268 16.3755C18.2908 15.4584 18.351 14.596 18.5 14C18.6803 13.2788 18.9256 12.6877 19.1656 12.1093C19.5912 11.0838 20 10.0985 20 8.5C20 6 19 4 17 4C16.0557 4 15.4458 4.22291 14.8019 4.45825C14.082 4.72136 13.3197 5 12 5C10.6803 5 9.91796 4.72136 9.19807 4.45825Z"
                  stroke="blue"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <Fade>
              <span className="self-center text-2xl font-bold">DentRW</span>
            </Fade>
          </a>
        </div>

        <div className="text-slate-400 grid grid-cols-2 text-sm gap-x-3 gap-y-8 lg:w-2/3 sm:grid-cols-4">
          <div className="space-y-3 ">
            <h3 className="dark:text-gray-50 font-semibold">SERVICES</h3>
            <ul className="space-y-1">
              <li>
                <a
                  rel="noreferrer noopener"
                  className="hover:underline hover:text-gray-300"
                  href="/"
                >
                  X-rays
                </a>
              </li>
              <li>
                <a
                  rel="noreferrer noopener"
                  className="hover:underline hover:text-gray-300"
                  href="/"
                >
                  Filling
                </a>
              </li>
              <li>
                <a
                  rel="noreferrer noopener"
                  className="hover:underline hover:text-gray-300"
                  href="/"
                >
                  Implants
                </a>
              </li>
              <li>
                <a
                  rel="noreferrer noopener"
                  className="hover:underline hover:text-gray-300"
                  href="/"
                >
                  Cleaning
                </a>
              </li>
              <li>
                <a
                  rel="noreferrer noopener"
                  className="hover:underline hover:text-gray-300"
                  href="/"
                >
                  Restoration
                </a>
              </li>

              <li>
                <a
                  rel="noreferrer noopener"
                  className="hover:underline hover:text-gray-300"
                  href="/"
                >
                  Consultation
                </a>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h3 className="dark:text-gray-50 font-semibold">COMPANY</h3>
            <ul className="space-y-1">
              <li>
                <a
                  rel="noreferrer noopener"
                  className="hover:underline hover:text-gray-300"
                  href="/"
                >
                  Team
                </a>
              </li>
              <li>
                <a
                  rel="noreferrer noopener"
                  className="hover:underline hover:text-gray-300"
                  href="/"
                >
                  Privacy
                </a>
              </li>
              <li>
                <a
                  rel="noreferrer noopener"
                  className="hover:underline hover:text-gray-300"
                  href="/"
                >
                  About us
                </a>
              </li>
              <li>
                <a
                  rel="noreferrer noopener"
                  className="hover:underline hover:text-gray-300"
                  href="/"
                >
                  Terms & Conditions
                </a>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h3 className="dark:text-gray-50 font-semibold">HELP DESK</h3>
            <ul className="space-y-1">
              <li>
                <a
                  rel="noreferrer noopener"
                  className="hover:underline hover:text-gray-300"
                  href="/"
                >
                  FAQS
                </a>
              </li>
              <li>
                <a
                  rel="noreferrer noopener"
                  className="hover:underline hover:text-gray-300"
                  href="/"
                >
                  Pricing
                </a>
              </li>
              <li>
                <a
                  rel="noreferrer noopener"
                  className="hover:underline hover:text-gray-300"
                  href="/"
                >
                  Booking
                </a>
              </li>
              <li>
                <a
                  rel="noreferrer noopener"
                  className="hover:underline hover:text-gray-300"
                  href="/"
                >
                  Insurance
                </a>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <div className="uppercase dark:dark:text-gray-50 font-semibold">
              Social media
            </div>
            <div className="flex justify-start space-x-3">
              <a
                rel="noopener noreferrer"
                href="/"
                title="Facebook"
                className="flex items-center p-1 "
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 32 32"
                  className="w-5 h-5 fill-current"
                >
                  <path d="M32 16c0-8.839-7.167-16-16-16-8.839 0-16 7.161-16 16 0 7.984 5.849 14.604 13.5 15.803v-11.177h-4.063v-4.625h4.063v-3.527c0-4.009 2.385-6.223 6.041-6.223 1.751 0 3.584 0.312 3.584 0.312v3.937h-2.021c-1.984 0-2.604 1.235-2.604 2.5v3h4.437l-0.713 4.625h-3.724v11.177c7.645-1.199 13.5-7.819 13.5-15.803z"></path>
                </svg>
              </a>
              <a
                rel="noopener noreferrer"
                href="/"
                title="Twitter"
                className="flex items-center p-1"
              >
                <svg
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 fill-current"
                >
                  <path d="M23.954 4.569a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.691 8.094 4.066 6.13 1.64 3.161a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.061a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.937 4.937 0 004.604 3.417 9.868 9.868 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.054 0 13.999-7.496 13.999-13.986 0-.209 0-.42-.015-.63a9.936 9.936 0 002.46-2.548l-.047-.02z"></path>
                </svg>
              </a>
              <a
                rel="noopener noreferrer"
                href="/"
                title="Instagram"
                className="flex items-center p-1"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 32 32"
                  fill="currentColor"
                  className="w-5 h-5 fill-current"
                >
                  <path d="M16 0c-4.349 0-4.891 0.021-6.593 0.093-1.709 0.084-2.865 0.349-3.885 0.745-1.052 0.412-1.948 0.959-2.833 1.849-0.891 0.885-1.443 1.781-1.849 2.833-0.396 1.020-0.661 2.176-0.745 3.885-0.077 1.703-0.093 2.244-0.093 6.593s0.021 4.891 0.093 6.593c0.084 1.704 0.349 2.865 0.745 3.885 0.412 1.052 0.959 1.948 1.849 2.833 0.885 0.891 1.781 1.443 2.833 1.849 1.020 0.391 2.181 0.661 3.885 0.745 1.703 0.077 2.244 0.093 6.593 0.093s4.891-0.021 6.593-0.093c1.704-0.084 2.865-0.355 3.885-0.745 1.052-0.412 1.948-0.959 2.833-1.849 0.891-0.885 1.443-1.776 1.849-2.833 0.391-1.020 0.661-2.181 0.745-3.885 0.077-1.703 0.093-2.244 0.093-6.593s-0.021-4.891-0.093-6.593c-0.084-1.704-0.355-2.871-0.745-3.885-0.412-1.052-0.959-1.948-1.849-2.833-0.885-0.891-1.776-1.443-2.833-1.849-1.020-0.396-2.181-0.661-3.885-0.745-1.703-0.077-2.244-0.093-6.593-0.093zM16 2.88c4.271 0 4.781 0.021 6.469 0.093 1.557 0.073 2.405 0.333 2.968 0.553 0.751 0.291 1.276 0.635 1.844 1.197 0.557 0.557 0.901 1.088 1.192 1.839 0.22 0.563 0.48 1.411 0.553 2.968 0.072 1.688 0.093 2.199 0.093 6.469s-0.021 4.781-0.099 6.469c-0.084 1.557-0.344 2.405-0.563 2.968-0.303 0.751-0.641 1.276-1.199 1.844-0.563 0.557-1.099 0.901-1.844 1.192-0.556 0.22-1.416 0.48-2.979 0.553-1.697 0.072-2.197 0.093-6.479 0.093s-4.781-0.021-6.48-0.099c-1.557-0.084-2.416-0.344-2.979-0.563-0.76-0.303-1.281-0.641-1.839-1.199-0.563-0.563-0.921-1.099-1.197-1.844-0.224-0.556-0.48-1.416-0.563-2.979-0.057-1.677-0.084-2.197-0.084-6.459 0-4.26 0.027-4.781 0.084-6.479 0.083-1.563 0.339-2.421 0.563-2.979 0.276-0.761 0.635-1.281 1.197-1.844 0.557-0.557 1.079-0.917 1.839-1.199 0.563-0.219 1.401-0.479 2.964-0.557 1.697-0.061 2.197-0.083 6.473-0.083zM16 7.787c-4.541 0-8.213 3.677-8.213 8.213 0 4.541 3.677 8.213 8.213 8.213 4.541 0 8.213-3.677 8.213-8.213 0-4.541-3.677-8.213-8.213-8.213zM16 21.333c-2.948 0-5.333-2.385-5.333-5.333s2.385-5.333 5.333-5.333c2.948 0 5.333 2.385 5.333 5.333s-2.385 5.333-5.333 5.333zM26.464 7.459c0 1.063-0.865 1.921-1.923 1.921-1.063 0-1.921-0.859-1.921-1.921 0-1.057 0.864-1.917 1.921-1.917s1.923 0.86 1.923 1.917z"></path>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
      <Fade>
        <div className="py-2 border-t text-sm text-center dark:text-gray-400">
          ©2023 - DentRW
        </div>
      </Fade>
    </footer>
  );
};

export default Footer;
