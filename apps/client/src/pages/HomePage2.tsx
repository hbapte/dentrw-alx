import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Link as ScrollLink } from "react-scroll";
import { Fade } from "react-awesome-reveal";
import { Calendar, Clock, Phone, Mail, MapPin, ChevronRight, Star, CheckCircle, Menu, X } from 'lucide-react';

const HomePage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const services = [
    {
      title: "General Dentistry",
      description: "Comprehensive dental care including check-ups, cleanings, and fillings.",
      icon: "🦷"
    },
    {
      title: "Cosmetic Dentistry",
      description: "Enhance your smile with whitening, veneers, and other aesthetic treatments.",
      icon: "✨"
    },
    {
      title: "Orthodontics",
      description: "Straighten your teeth with braces or clear aligners for a perfect smile.",
      icon: "😁"
    },
    {
      title: "Oral Surgery",
      description: "Expert surgical procedures including extractions and implant placement.",
      icon: "🔧"
    },
    {
      title: "Pediatric Dentistry",
      description: "Child-friendly dental care in a comfortable environment.",
      icon: "👶"
    },
    {
      title: "Emergency Care",
      description: "Immediate attention for dental emergencies and pain relief.",
      icon: "🚑"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      text: "The team at DentRW made my dental experience incredibly comfortable. Dr. Miller was thorough and gentle during my treatment.",
      rating: 5
    },
    {
      name: "Michael Chen",
      text: "I've been terrified of dentists my whole life, but this clinic changed everything. The staff is patient and understanding.",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      text: "The modern facilities and technology they use make every visit efficient. I'm always in and out in no time!",
      rating: 4
    }
  ];

  const team = [
    {
      name: "Dr. James Miller",
      role: "Lead Dentist",
      bio: "With over 15 years of experience, Dr. Miller specializes in cosmetic dentistry and complex restorations.",
      image: "/placeholder.svg?height=300&width=300"
    },
    {
      name: "Dr. Lisa Wong",
      role: "Orthodontist",
      bio: "Dr. Wong is an expert in modern orthodontic techniques, helping patients achieve their perfect smile.",
      image: "/placeholder.svg?height=300&width=300"
    },
    {
      name: "Dr. Robert Johnson",
      role: "Oral Surgeon",
      bio: "Specializing in implants and extractions, Dr. Johnson ensures every surgical procedure is comfortable and successful.",
      image: "/placeholder.svg?height=300&width=300"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <header className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? "bg-white shadow-md py-2" : "bg-transparent py-4"}`}>
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-teal-600">DentRW</Link>
          
          {/* Mobile menu button */}
          <button className="md:hidden text-gray-700" onClick={toggleMenu}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <ScrollLink to="home" smooth={true} duration={500} className="text-gray-700 hover:text-teal-600 cursor-pointer">Home</ScrollLink>
            <ScrollLink to="services" smooth={true} duration={500} className="text-gray-700 hover:text-teal-600 cursor-pointer">Services</ScrollLink>
            <ScrollLink to="about" smooth={true} duration={500} className="text-gray-700 hover:text-teal-600 cursor-pointer">About</ScrollLink>
            <ScrollLink to="team" smooth={true} duration={500} className="text-gray-700 hover:text-teal-600 cursor-pointer">Team</ScrollLink>
            <ScrollLink to="testimonials" smooth={true} duration={500} className="text-gray-700 hover:text-teal-600 cursor-pointer">Testimonials</ScrollLink>
            <ScrollLink to="contact" smooth={true} duration={500} className="text-gray-700 hover:text-teal-600 cursor-pointer">Contact</ScrollLink>
            <Link to="/login" className="text-teal-600 hover:text-teal-700 font-medium">Login</Link>
          </nav>
        </div>
        
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white shadow-lg">
            <div className="container mx-auto px-4 py-3 flex flex-col space-y-3">
              <ScrollLink to="home" smooth={true} duration={500} className="text-gray-700 hover:text-teal-600 cursor-pointer" onClick={toggleMenu}>Home</ScrollLink>
              <ScrollLink to="services" smooth={true} duration={500} className="text-gray-700 hover:text-teal-600 cursor-pointer" onClick={toggleMenu}>Services</ScrollLink>
              <ScrollLink to="about" smooth={true} duration={500} className="text-gray-700 hover:text-teal-600 cursor-pointer" onClick={toggleMenu}>About</ScrollLink>
              <ScrollLink to="team" smooth={true} duration={500} className="text-gray-700 hover:text-teal-600 cursor-pointer" onClick={toggleMenu}>Team</ScrollLink>
              <ScrollLink to="testimonials" smooth={true} duration={500} className="text-gray-700 hover:text-teal-600 cursor-pointer" onClick={toggleMenu}>Testimonials</ScrollLink>
              <ScrollLink to="contact" smooth={true} duration={500} className="text-gray-700 hover:text-teal-600 cursor-pointer" onClick={toggleMenu}>Contact</ScrollLink>
              <Link to="/login" className="text-teal-600 hover:text-teal-700 font-medium" onClick={toggleMenu}>Login</Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section id="home" className="pt-24 md:pt-32 pb-16 md:pb-24 bg-gradient-to-br from-teal-50 to-blue-50">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
          <Fade direction="left" triggerOnce>
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-4">Your Smile, Our Passion</h1>
              <p className="text-lg text-gray-600 mb-8">Experience exceptional dental care with our team of experts using the latest technology in a comfortable environment.</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register" className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 px-6 rounded-lg text-center transition-colors">
                  Book Appointment
                </Link>
                <ScrollLink to="services" smooth={true} duration={500} className="bg-white hover:bg-gray-100 text-teal-600 font-medium py-3 px-6 rounded-lg border border-teal-600 text-center cursor-pointer transition-colors">
                  Our Services
                </ScrollLink>
              </div>
            </div>
          </Fade>
          
          <Fade direction="right" triggerOnce>
            <div className="md:w-1/2">
              <img 
                src="/placeholder.svg?height=500&width=600" 
                alt="Dental care illustration" 
                className="rounded-lg shadow-xl"
              />
            </div>
          </Fade>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Fade cascade damping={0.2} triggerOnce>
              <div className="flex items-start p-6 bg-teal-50 rounded-lg">
                <div className="mr-4 bg-teal-100 p-3 rounded-full">
                  <Calendar className="text-teal-600" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Easy Scheduling</h3>
                  <p className="text-gray-600">Book appointments online anytime, anywhere.</p>
                </div>
              </div>
              
              <div className="flex items-start p-6 bg-teal-50 rounded-lg">
                <div className="mr-4 bg-teal-100 p-3 rounded-full">
                  <Clock className="text-teal-600" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Extended Hours</h3>
                  <p className="text-gray-600">Evening and weekend appointments available.</p>
                </div>
              </div>
              
              <div className="flex items-start p-6 bg-teal-50 rounded-lg">
                <div className="mr-4 bg-teal-100 p-3 rounded-full">
                  <CheckCircle className="text-teal-600" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Modern Technology</h3>
                  <p className="text-gray-600">State-of-the-art equipment for better care.</p>
                </div>
              </div>
            </Fade>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <Fade direction="up" triggerOnce>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Our Services</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">Comprehensive dental care for patients of all ages, using the latest techniques and technology.</p>
            </div>
          </Fade>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Fade key={index} direction="up" delay={index * 100} triggerOnce>
                <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <div className="text-4xl mb-4">{service.icon}</div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-800">{service.title}</h3>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  <Link to="/login" className="inline-flex items-center text-teal-600 hover:text-teal-700 font-medium">
                    Learn more <ChevronRight size={16} className="ml-1" />
                  </Link>
                </div>
              </Fade>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <Fade direction="left" triggerOnce>
              <div className="md:w-1/2 mb-10 md:mb-0 md:pr-10">
                <img 
                  src="/placeholder.svg?height=400&width=500" 
                  alt="Modern dental clinic" 
                  className="rounded-lg shadow-lg"
                />
              </div>
            </Fade>
            
            <Fade direction="right" triggerOnce>
              <div className="md:w-1/2">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">About Our Clinic</h2>
                <p className="text-lg text-gray-600 mb-6">
                  Founded in 2010, DentRW has been providing exceptional dental care to our community for over a decade. Our mission is to deliver personalized, high-quality dental services in a comfortable and welcoming environment.
                </p>
                <p className="text-lg text-gray-600 mb-6">
                  We believe in preventive care and patient education as the keys to optimal dental health. We aim to provide dental health care, not disease care.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <CheckCircle className="text-teal-600 mr-2" size={20} />
                    <span className="text-gray-700">Modern Facility</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="text-teal-600 mr-2" size={20} />
                    <span className="text-gray-700">Expert Team</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="text-teal-600 mr-2" size={20} />
                    <span className="text-gray-700">Latest Technology</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="text-teal-600 mr-2" size={20} />
                    <span className="text-gray-700">Patient-Centered Care</span>
                  </div>
                </div>
              </div>
            </Fade>
          </div>
        </div>
      </section>

      {/* Team */}
      <section id="team" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <Fade direction="up" triggerOnce>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Meet Our Team</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">Our experienced dental professionals are dedicated to providing you with the highest quality care.</p>
            </div>
          </Fade>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Fade key={index} direction="up" delay={index * 100} triggerOnce>
                <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                  <img 
                    src={member.image || "/placeholder.svg"} 
                    alt={member.name} 
                    className="w-full h-64 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-1 text-gray-800">{member.name}</h3>
                    <p className="text-teal-600 font-medium mb-3">{member.role}</p>
                    <p className="text-gray-600">{member.bio}</p>
                  </div>
                </div>
              </Fade>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-16 bg-teal-50">
        <div className="container mx-auto px-4">
          <Fade direction="up" triggerOnce>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">What Our Patients Say</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">Don't just take our word for it. Here's what our patients have to say about their experiences.</p>
            </div>
          </Fade>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Fade key={index} direction="up" delay={index * 100} triggerOnce>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="text-yellow-400 fill-current" size={20} />
                    ))}
                    {[...Array(5 - testimonial.rating)].map((_, i) => (
                      <Star key={i + testimonial.rating} className="text-gray-300" size={20} />
                    ))}
                  </div>
                  <p className="text-gray-600 italic mb-4">"{testimonial.text}"</p>
                  <p className="font-medium text-gray-800">{testimonial.name}</p>
                </div>
              </Fade>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row">
            <Fade direction="left" triggerOnce>
              <div className="md:w-1/2 mb-10 md:mb-0 md:pr-10">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Contact Us</h2>
                <p className="text-lg text-gray-600 mb-8">Have questions or ready to schedule your appointment? Reach out to us using the form or contact information below.</p>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-start">
                    <div className="mr-4 bg-teal-100 p-2 rounded-full">
                      <MapPin className="text-teal-600" size={20} />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">Address</h4>
                      <p className="text-gray-600">123 Dental Street, Medical District<br />New York, NY 10001</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="mr-4 bg-teal-100 p-2 rounded-full">
                      <Phone className="text-teal-600" size={20} />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">Phone</h4>
                      <p className="text-gray-600">(123) 456-7890</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="mr-4 bg-teal-100 p-2 rounded-full">
                      <Mail className="text-teal-600" size={20} />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">Email</h4>
                      <p className="text-gray-600">info@dentrw.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="mr-4 bg-teal-100 p-2 rounded-full">
                      <Clock className="text-teal-600" size={20} />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">Hours</h4>
                      <p className="text-gray-600">
                        Monday - Friday: 8:00 AM - 7:00 PM<br />
                        Saturday: 9:00 AM - 5:00 PM<br />
                        Sunday: Closed
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Fade>
            
            <Fade direction="right" triggerOnce>
              <div className="md:w-1/2">
                <form className="bg-gray-50 p-6 rounded-lg shadow-md">
                  <div className="mb-4">
                    <label htmlFor="name" className="block text-gray-700 font-medium mb-2">Name</label>
                    <input 
                      type="text" 
                      id="name" 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Your name"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="email" className="block text-gray-700 font-medium mb-2">Email</label>
                    <input 
                      type="email" 
                      id="email" 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Your email"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">Phone</label>
                    <input 
                      type="tel" 
                      id="phone" 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Your phone number"
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="message" className="block text-gray-700 font-medium mb-2">Message</label>
                    <textarea 
                      id="message" 
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="How can we help you?"
                    ></textarea>
                  </div>
                  
                  <button 
                    type="submit" 
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                  >
                    Send Message
                  </button>
                </form>
              </div>
            </Fade>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4">DentRW</h3>
              <p className="text-gray-300 mb-4">Providing exceptional dental care with a gentle touch and state-of-the-art technology.</p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link to="/" className="text-gray-300 hover:text-white transition-colors">Home</Link></li>
                <li><Link to="/about" className="text-gray-300 hover:text-white transition-colors">About</Link></li>
                <li><Link to="/services" className="text-gray-300 hover:text-white transition-colors">Services</Link></li>
                <li><Link to="/login" className="text-gray-300 hover:text-white transition-colors">Patient Portal</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Services</h4>
              <ul className="space-y-2">
                <li><Link to="/services" className="text-gray-300 hover:text-white transition-colors">General Dentistry</Link></li>
                <li><Link to="/services" className="text-gray-300 hover:text-white transition-colors">Cosmetic Dentistry</Link></li>
                <li><Link to="/services" className="text-gray-300 hover:text-white transition-colors">Orthodontics</Link></li>
                <li><Link to="/services" className="text-gray-300 hover:text-white transition-colors">Oral Surgery</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <address className="not-italic text-gray-300 space-y-2">
                <p>123 Dental Street</p>
                <p>New York, NY 10001</p>
                <p>Phone: (123) 456-7890</p>
                <p>Email: info@dentrw.com</p>
              </address>
            </div>
          </div>
          
          <div className="border-t border-gray-700 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 mb-4 md:mb-0">&copy; {new Date().getFullYear()} DentRW. All rights reserved.</p>
              <div className="flex space-x-4">
                <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link>
                <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
