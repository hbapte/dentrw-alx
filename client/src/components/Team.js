import React from 'react'
import Arriana from './Images/arriana.jpg'
import Chance from './Images/chance.jpg'
import Gateme from './Images/gateme.jpg'
import Theodat from './Images/theodat.jpg'

const Team = () => {
  return (
    <section class="mt-16 bg-slate-100 dark:bg-gray-900">
    
    <div class="container px-6 py-12 mx-auto">
        <h2 class=" font-semibold text-center text-gray-800 capitalize text-3xl dark:text-white">Meet Our dedicated <span className="text-blue-500">Dentistry </span> Team</h2>

        <div class="grid gap-8 mt-12 grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
            <div class="w-full max-w-xs text-center">
                <img class="object-cover object-center w-full h-60 mx-auto rounded-lg" src={Gateme} alt="avatar" />

                <div class="mt-2">
                    <h3 class="text-md font-bold text-gray-700 dark:text-gray-200">GATEME Matata </h3>
                    <span class="mt-1 font-medium text-gray-600 dark:text-gray-300">Orthodontist</span>
                </div>
            </div>

            <div class="w-full max-w-xs text-center">
                <img class="object-cover object-center w-full h-60 mx-auto rounded-lg" src={Chance} alt="avatar" />

                <div class="mt-2">
                    <h3 class="text-md font-bold text-gray-700 dark:text-gray-200">Mahoro Eunice</h3>
                    <span class="mt-1 font-medium text-gray-600 dark:text-gray-300">Therapist</span>
                </div>
            </div>

            <div class="w-full max-w-xs text-center">
                <img class="object-cover object-center w-full  h-60 mx-auto rounded-lg" src={Theodat}  alt="avatar" />

                <div class="mt-2">
                    <h3 class="text-md font-bold text-gray-700 dark:text-gray-200">Ibaka M. Theodat</h3>
                    <span class="mt-1 font-medium text-gray-600 dark:text-gray-300">Dental Surgeon</span>
                </div>
            </div>

            <div class="w-full max-w-xs text-center">
                <img class="object-cover object-center w-full h-60 mx-auto rounded-lg" src={Arriana} alt="avatar" />

                <div class="mt-2">
                    <h3 class="text-md font-bold text-gray-700 dark:text-gray-200">DUKUNDE Arriana</h3>
                    <span class="mt-1 font-medium text-gray-600 dark:text-gray-300">Assistant</span>
                </div>
            </div>
        </div>
    </div>
</section>
  )
}

export default Team