import React from 'react'
import homepicture from './Images/home.png'


const Hero = () => {
  return (
    <main>
    <div class="">
  <header class="relative flex  flex-col overflow-hidden px-4 py-4 text-blue-900 md:mx-auto md:flex-row md:items-center">
  <a href="/" className="flex cursor-pointer items-center whitespace-nowrap text-2xl font-black">
  <span className="mr-2 text-4xl text-blue-500">
  
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="40" height="40">
      <path
        d="M40 90c1-8.7 2.4-17.2 4.2-25.2 2.4-10.5 5.5-18.6 9.4-24.5 4.2-6.4 9.4-9.4 15.9-9.4s11.7 3 15.9 9.4c3.9 5.9 7 14 9.4 24.5 1.8 8 3.2 16.5 4.2 25.2-6.1 0-11 5-11 11s-4.9 11-11 11-11-4.9-11-11c0-6 4.9-11 11-11s11 4.9 11 11c0 .2-.1.3-.1.5-1.4-5.3-5.8-9-10.9-9-5.4 0-9.8 4.4-9.8 9.8 0 2.7 1.1 5.1 2.8 6.8-.2 0-.4-.1-.6-.1-6 0-11 4.9-11 11s4.9 11 11 11zm10-60c2.8 0 5 2.2 5 5s-2.2 5-5 5-5-2.2-5-5 2.2-5 5-5zm20 0c2.8 0 5 2.2 5 5s-2.2 5-5 5-5-2.2-5-5 2.2-5 5-5zM40 80c-1 0-2-.8-2-2s.8-2 2-2 2 .8 2 2-.9 2-2 2zm30 0c-1 0-2-.8-2-2s.8-2 2-2 2 .8 2 2-.9 2-2 2z"
        fill="#4F46E5"
      />
    </svg>
  </span>
  DentRW
</a>

    <input type="checkbox" class="peer hidden" id="navbar-open" />
    <label class="absolute top-2 right-2 cursor-pointer md:hidden" for="navbar-open">
      <span class="sr-only">Toggle Navigation</span>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </label>
    <nav aria-label="Header Navigation" class="peer-checked:mt-8 peer-checked:max-h-56 flex max-h-0 w-full flex-col items-center justify-between overflow-hidden transition-all md:ml-12 md:max-h-full md:flex-row md:items-start">
      <ul class="flex flex-col items-center space-y-2 md:ml-auto md:flex-row md:space-y-0">
        <li class="font-bold md:mr-12"><a href="/">Services</a></li>
        <li class="md:mr-12 hover:text-blue-500"><a href="/">Support</a></li>
        <li class="md:mr-12 hover:text-blue-500" ><a href="/">Features</a></li>
        <li class="md:mr-12 hover:text-blue-500">
          <button class="rounded-full border-2 border-blue-900 hover:border-blue-500 px-6 py-1 text-blue-900 transition-colors hover:bg-blue-600 hover:text-white">Book Now</button>
        </li>
      </ul>
    </nav>
  </header>

  <div class="mx-auto h-full px-4 py-10 sm:max-w-xl md:max-w-full md:px-24 md:py-36 lg:px-8">
    <div class="flex flex-col items-center justify-between lg:flex-row">
      <div class="">
        <div class="lg:max-w-xl lg:pr-5">
          <h2 class="mb-6 max-w-lg text-5xl font-light leading-snug tracking-tight text-blue-600 sm:text-8xl">
            Meet your <br />
            
            <span class="my-1 inline-block border-b-8 border-blue-600 font-bold text-blue-600"> Dentist </span>
          </h2>
          <p class="text-base text-gray-700">Harmonizing Oral health and creating beautiful smiles. Bringing confidence and wellness to your life through modern dental care!</p>
        </div>
        <div class="mt-10 flex flex-col items-center md:flex-row">
          <a href="/" class="mb-3 inline-flex h-12 w-full items-center justify-center rounded bg-blue-700 px-6 font-medium tracking-wide text-white shadow-md transition duration-200 md:mr-4 md:mb-0 md:w-auto focus:outline-none hover:bg-blue-800">Book Appointment</a>
          <a href="/" aria-label="" class="underline-offset-2 inline-flex items-center text-xl font-bold text-blue-600 underline transition-colors duration-200 hover:underline">Get Started</a>
        </div>
        <div class="mt-12 flex flex-col space-y-3 divide-gray-300 text-sm text-gray-700 sm:flex-row sm:space-y-0 sm:divide-x">
          <div class="flex max-w-xs space-x-2 px-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <p>We are dedicated to providing comprehensive, quality dental care</p>
          </div>
          <div class="flex max-w-xs space-x-2 px-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
            <p> Leading dental clinic in Kigali, Rwanda</p>
          </div>
        </div>
      </div>
      <div class="relative hidden lg:ml-32 lg:block lg:w-1/2">
        <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto my-6 h-10 w-10 animate-bounce rounded-full bg-blue-50 p-2 lg:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M16 17l-4 4m0 0l-4-4m4 4V3" />
        </svg>
        <div class="w-fit rounded-[6rem] mx-auto overflow-hidden rounded-tl-none rounded-br-none bg-blue-400">
          <svg xmlns="http://www.w3.org/2000/svg" class="absolute -left-10 -top-20 h-28 w-28 rounded-xl bg-white text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <svg xmlns="http://www.w3.org/2000/svg" class="absolute right-0 -bottom-20 h-28 w-28 rounded-xl bg-white text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clip-rule="evenodd" />
          </svg>
          <img class="-mb-20" src={homepicture} alt="hero portrait" />
        </div>
      </div>
    </div>
  </div>
</div>
</main>


  )
}

export default Hero;