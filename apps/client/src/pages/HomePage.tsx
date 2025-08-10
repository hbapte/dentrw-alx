import Navbar from "../components/layouts/header/Navbar";
import Hero from "../components/sections/Hero";
import Insurance from "../components/sections/Insurance";
import Services from "../components/sections/Services";
import Team from "../components/sections/Team";
// import Testimonials from "../components/Testimonials";
import FAQs from "../components/sections/FAQs";
import Contact from "../components/sections/Contact";
import Footer from "../components/layouts/Footer";
import Features from "../components/sections/Features";


export default function App() {
  return (
    <div>
      <Navbar />
      <Hero />
      <Services />
      <Insurance />
      <Features  /> 
      <Team />
      {/* <Testimonials /> */}
      <FAQs />
      <Contact />
      < Footer />
    </div>
  );
}