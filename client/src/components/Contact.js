import React from "react";

const Contact = () => {
  return (
    <div className="max-w-screen-lg mx-auto p-2">
      <div className="grid grid-cols-1 md:grid-cols-12 border rounded-md">
        <div className="bg-slate-100 md:col-span-4 p-7 text-gray-900">
          <p className="mt-4 text-sm leading-7 font-regular uppercase">
            Contact
          </p>
          <h3 className="text-3xl sm:text-4xl leading-normal font-extrabold tracking-tight">
            Get In <span className="text-[#3b82f6]">Touch</span>
          </h3>
          <p class="mt-4 leading-6 text-gray-950">
            Book appointment with our doctors. Our team waits you.
          </p>

          <p className="my-4 uppercase font-semibold border-b border-b-black pb-2">
            Clinic Hours
          </p>
          <p className="font-normal">Monday - Friday: 06:00 - 17:00</p>
          <p className="font-normal">Saturday: 10:00 - 16:00</p>
          <p className="mb-8"> Sunday : Closed</p>

          <p className=" mt-3 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="#3b82f6"
              className="w-5 h-5 mr-2 sm:mr-3"
            >
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path>
            </svg>
            <span>+25073000020</span>
          </p>
          <p className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="#3b82f6"
              className="w-5 h-5 mr-2 sm:mr-3"
            >
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
            </svg>
            <span>dentrw@clinic.com</span>
          </p>

          <p className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="#3b82f6"
              className="w-5 h-5 mr-2 sm:mr-3"
            >
              <path
                fillRule="evenodd"
                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                clipRule="evenodd"
              ></path>
            </svg>
            <span>KG 14 Ave - Remera, Rwanda</span>
          </p>
        </div>
        <form class="md:col-span-8 px-10 pt-5 pb-3">
  <div class="mb-3">
    <label for="name" class="mb-1 block text-base font-medium text-[#07074D]">
      Full Name
    </label>
    <input
      type="text"
      name="name"
      id="name"
      placeholder="Full Name"
      class="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
      required
    />
  </div> 

  <div class="-mx-3 flex flex-wrap">
    <div class="w-full px-3 sm:w-1/2">
      <div class="mb-5">
        <label for="phone" class="mb-1 block text-base font-medium text-[#07074D]">
          Phone Number
        </label>
        <input
          type="tel"
          name="phone"
          id="phone"
          placeholder="Enter your phone number"
          class="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
          required
        />
      </div>
    </div>
    <div class="w-full px-3 sm:w-1/2">
      <div class="mb-5">
        <label for="email" class="mb-1 block text-base font-medium text-[#07074D]">
          Email Address
        </label>
        <input
          type="email"
          name="email"
          id="email"
          placeholder="Enter your email"
          class="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
          required
        />
      </div>
    </div>
  </div>
  

  <div class="-mx-3 mb-5">
    <label for="dentalServices" class="mb-1 block text-base font-medium text-[#07074D]">
      Dental Services
    </label>
    <select name="dentalServices" id="dentalServices" class="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md">
      <option value="dentalCleaning">Dental Cleaning and Check-up</option>
      <option value="x-rays">X-rays</option>
      <option value="fillings">Fillings</option>
      <option value="crownsBridges">Crowns and Bridges</option>
      <option value="rootCanal">Root Canal Treatment</option>
      <option value="teethWhitening">Teeth Whitening</option>
      <option value="orthodontic">Orthodontic Treatment</option>
      <option value="periodontal">Periodontal Treatment</option>
      <option value="dentalImplants">Dental Implants</option>
      <option value="oralSurgery">Oral Surgery</option>
    </select>
  </div>
  
  <div class="-mx-3 flex flex-wrap">
    <div class="w-full px-3 sm:w-1/2">
      <div class="mb-5">
        <label for="date" class="mb-1 block text-base font-medium text-[#07074D]">
          Date
        </label>
        <input
          type="date"
          name="date"
          id="date"
          class="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
        />
      </div>
    </div>
    <div class="w-full px-3 sm:w-1/2">
      <div class="mb-5">
        <label for="time" class="mb-1 block text-base font-medium text-[#07074D]">
          Time
        </label>
        <input
          type="time"
          name="time"
          id="time"
          class="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
        />
      </div>
    </div>
  </div>
  
  <div className="w-full mb-3">
    <label
      className="mb-1 block text-base font-medium text-[#07074D]"
      for="text-area"
    >
      Doctor Note
    </label>
    <textarea
      id="text-area"
      rows="3"
      className="resize-none w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
    ></textarea>
  </div>
  
  <div className="mt-5">
    <button type="submit" className="hover:shadow-form w-full rounded-md bg-blue-500 py-3 px-8 text-center text-base font-semibold text-white outline-none">
      Book Appointment
    </button>
  </div>
</form>

      </div>
    </div>
  );
};

export default Contact;
