import React from "react"

import "./index.css"

import Contact from "./components/Contact"
import FAQs from "./components/FAQs"
import Features from "./components/Features"
import Footer from "./components/Footer"
import Hero from "./components/Hero"
import Insurance from "./components/Insurance"
// Components
import Navbar from "./components/Navbar"
import Services from "./components/Services"
import Team from "./components/Team"
import Testimonials from "./components/Testimonials"

export default function App() {
  return (
    <div>
      <Navbar />
      <Hero />
      <Services />
      <Insurance />
      <Features />
      <Team />
      <Testimonials />
      <FAQs />
      <Contact />
      <Footer />
    </div>
  )
}
