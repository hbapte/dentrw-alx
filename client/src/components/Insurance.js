import React from 'react'
import RSSB from './Images/insurance/rssb.png'
import MMI from './Images/insurance/mmi.png'
import PRIME from './Images/insurance/prime.png'
import RADIANT from './Images/insurance/radiant.png'
import SORAS from './Images/insurance/Soras.png'
import BRITAM from './Images/insurance/britam.png'
import BK from './Images/insurance/BK.png'
import SANLAM from './Images/insurance/sanlam.png'

const Insurance = () => {
  return (
    <section className="mt-16">
    <h1 className='my-6 text-center font-bold text-3xl'>Proudly to work with  <span className="text-gray-600">Insurance </span> Companies</h1>
<div class="slider grid grid-cols-8  bg-slate-200 shadow-xl opacity-[90%] h-100 mx-auto overflow-hidden relative ">

  {/* <div class="slide-track animate-scroll"> */}
    <div class="slide h-100 w-250">
      <img src={RSSB} className='object-cover' height="100" width="250" alt="" />
    </div>
    <div class="slide h-100 w-250">
      <img src={SANLAM} height="100" width="250" alt="" />
    </div>
    <div class="slide h-100 w-250">
      <img src={MMI} height="10" width="250" alt="" />
    </div>
    <div class="slide h-100 w-250">
      <img src={BRITAM} className='' alt="" />
    </div>
    <div class="slide h-100 w-250">
      <img src={SORAS} height="100" width="250" alt="" />
    </div>

    <div class="slide h-100 w-250">
      <img src={PRIME} height="100" width="250" alt="Prime Insurance" />
    </div>
    <div class="slide h-100 w-250">
      <img src={RADIANT} height="50" width="250" alt="" />
    </div>


    <div class="slide h-100 w-250">
      <img src={BK} height="100" width="250" alt="" />
    </div>

    
    </div>
    
    </section>

  )
}

export default Insurance;