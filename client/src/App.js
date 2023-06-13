import React from "react";
import "./index.css";


// Components
import Hero from "./components/Hero";
import Insurance from "./components/Insurance";
import Services from "./components/Services";
import Team from "./components/Team";
import Testimonials from "./components/Testimonials";
import FAQs from "./components/FAQs";
import Contact from "./components/Contact";
// import Subscribe from "./components/Subscribe";
import Footer from "./components/Footer";
import Features from "./components/Features";

// import Sign from "./components/Sign"; 

export default function App() {
  return (
    <div>
      <Hero />
      <Services />
      <Insurance />
      <Features  /> 
      <Team />
      <Testimonials />
      <FAQs />
      {/* <Subscribe /> */}
      <Contact />
      < Footer />
     
      
        
  
      
    </div>
  );
}
