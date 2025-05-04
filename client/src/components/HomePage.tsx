"use client"

import type React from "react"
import { useState } from "react"
import { Link } from "react-router-dom"
import { Calendar, Phone, Mail, Clock, MapPin, ChevronRight, Star, CheckCircle } from "lucide-react"
import { useAuthStore } from "../store/auth-store"

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuthStore()
  const [activeTestimonial, setActiveTestimonial] = useState(0)

  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Patient",
      image: "/placeholder.svg?height=80&width=80",
      quote:
        "The team at dentRW has completely transformed my dental experience. Their gentle approach and state-of-the-art technology made my treatment comfortable and effective.",
      rating: 5,
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Patient",
      image: "/placeholder.svg?height=80&width=80",
      quote:
        "I've been coming to dentRW for over 3 years now. The staff is always friendly, appointments are on time, and the care is exceptional. Highly recommended!",
      rating: 5,
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      role: "Patient",
      image: "/placeholder.svg?height=80&width=80",
      quote:
        "As someone with dental anxiety, I can't express how much I appreciate the patience and care shown by everyone at dentRW. They take the time to ensure I'm comfortable.",
      rating: 5,
    },
  ]

  const services = [
    {
      title: "General Dentistry",
      description: "Comprehensive dental care including check-ups, cleanings, and preventive treatments.",
      icon: <CheckCircle className="h-8 w-8 text-blue-500" />,
    },
    {
      title: "Cosmetic Dentistry",
      description: "Enhance your smile with teeth whitening, veneers, and other aesthetic procedures.",
      icon: <CheckCircle className="h-8 w-8 text-blue-500" />,
    },
    {
      title: "Orthodontics",
      description: "Straighten your teeth with braces or clear aligners for a perfect smile.",
      icon: <CheckCircle className="h-8 w-8 text-blue-500" />,
    },
    {
      title: "Oral Surgery",
      description: "Expert surgical procedures including extractions and implant placement.",
      icon: <CheckCircle className="h-8 w-8 text-blue-500" />,
    },
    {
      title: "Pediatric Dentistry",
      description: "Specialized dental care for children in a friendly, comfortable environment.",
      icon: <CheckCircle className="h-8 w-8 text-blue-500" />,
    },
    {
      title: "Emergency Care",
      description: "Prompt attention for dental emergencies to relieve pain and prevent complications.",
      icon: <CheckCircle className="h-8 w-8 text-blue-500" />,
    },
  ]

  const team = [
    {
      name: "Dr. Robert Wilson",
      role: "Lead Dentist",
      image: "/placeholder.svg?height=300&width=300",
      bio: "Dr. Wilson has over 15 years of experience in general and cosmetic dentistry.",
    },
    {
      name: "Dr. Lisa Chen",
      role: "Orthodontist",
      image: "/placeholder.svg?height=300&width=300",
      bio: "Specializing in orthodontics, Dr. Chen helps patients achieve their perfect smile.",
    },
    {
      name: "Dr. James Taylor",
      role: "Oral Surgeon",
      image: "/placeholder.svg?height=300&width=300",
      bio: "With expertise in complex procedures, Dr. Taylor ensures the best surgical outcomes.",
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <header className="sticky top-0 z-10 bg-white shadow">
        <div className="mx-auto flex max-w-7xl items-center justify-between p-4">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-blue-600">
              dentRW
            </Link>
          </div>
          <nav className="hidden space-x-8 md:flex">
            <a href="#services" className="text-gray-600 hover:text-blue-600">
              Services
            </a>
            <a href="#about" className="text-gray-600 hover:text-blue-600">
              About
            </a>
            <a href="#team" className="text-gray-600 hover:text-blue-600">
              Our Team
            </a>
            <a href="#testimonials" className="text-gray-600 hover:text-blue-600">
              Testimonials
            </a>
            <a href="#contact" className="text-gray-600 hover:text-blue-600">
              Contact
            </a>
          </nav>
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-blue-600">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-50 to-indigo-50 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
              <div>
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block">Your Smile,</span>
                  <span className="block text-blue-600">Our Passion</span>
                </h1>
                <p className="mt-6 max-w-lg text-xl text-gray-500">
                  Experience exceptional dental care with our team of experts. We're committed to providing comfortable,
                  personalized treatment for your entire family.
                </p>
                <div className="mt-10 flex items-center gap-x-6">
                  <Link
                    to={isAuthenticated ? "/appointments/add" : "/register"}
                    className="rounded-md bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Book Appointment
                  </Link>
                  <a
                    href="#services"
                    className="flex items-center text-base font-medium text-blue-600 hover:text-blue-500"
                  >
                    Our Services <ChevronRight className="ml-1 h-4 w-4" />
                  </a>
                </div>
              </div>
              <div className="hidden md:block">
                <img
                  src="/placeholder.svg?height=500&width=500"
                  alt="Dental care illustration"
                  className="h-auto w-full rounded-lg shadow-xl"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="bg-white py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Our Services</h2>
              <p className="mx-auto mt-4 max-w-2xl text-xl text-gray-500">
                Comprehensive dental care for all your needs
              </p>
            </div>

            <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                >
                  <div className="mb-4">{service.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900">{service.title}</h3>
                  <p className="mt-2 text-gray-600">{service.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="bg-blue-50 py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
              <div className="hidden md:block">
                <img
                  src="/placeholder.svg?height=500&width=500"
                  alt="Modern dental clinic"
                  className="h-auto w-full rounded-lg shadow-xl"
                />
              </div>
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">About dentRW</h2>
                <p className="mt-6 text-lg text-gray-600">
                  Founded in 2010, dentRW has been providing exceptional dental care to our community for over a decade.
                  Our state-of-the-art facility is equipped with the latest technology to ensure the highest quality of
                  care.
                </p>
                <p className="mt-4 text-lg text-gray-600">
                  We believe in a patient-centered approach, taking the time to understand your unique needs and
                  concerns. Our team is committed to creating a comfortable, stress-free environment for all our
                  patients.
                </p>
                <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex items-center">
                    <CheckCircle className="mr-2 h-5 w-5 text-blue-500" />
                    <span className="text-gray-700">State-of-the-art facility</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="mr-2 h-5 w-5 text-blue-500" />
                    <span className="text-gray-700">Experienced professionals</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="mr-2 h-5 w-5 text-blue-500" />
                    <span className="text-gray-700">Personalized care</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="mr-2 h-5 w-5 text-blue-500" />
                    <span className="text-gray-700">Affordable treatment plans</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section id="team" className="bg-white py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Meet Our Team</h2>
              <p className="mx-auto mt-4 max-w-2xl text-xl text-gray-500">
                Experienced professionals dedicated to your dental health
              </p>
            </div>

            <div className="mt-16 grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
              {team.map((member, index) => (
                <div key={index} className="overflow-hidden rounded-lg bg-white shadow-lg">
                  <img
                    src={member.image || "/placeholder.svg"}
                    alt={member.name}
                    className="h-64 w-full object-cover"
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900">{member.name}</h3>
                    <p className="text-blue-600">{member.role}</p>
                    <p className="mt-4 text-gray-600">{member.bio}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="bg-blue-50 py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">What Our Patients Say</h2>
              <p className="mx-auto mt-4 max-w-2xl text-xl text-gray-500">
                Read testimonials from our satisfied patients
              </p>
            </div>

            <div className="relative mt-16 overflow-hidden rounded-2xl bg-white p-6 shadow-lg md:p-10">
              <div className="mx-auto max-w-3xl text-center">
                <div className="flex justify-center">
                  <img
                    src={testimonials[activeTestimonial].image || "/placeholder.svg"}
                    alt={testimonials[activeTestimonial].name}
                    className="h-20 w-20 rounded-full object-cover"
                  />
                </div>
                <div className="mt-4 flex justify-center">
                  {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-current text-yellow-400" />
                  ))}
                </div>
                <blockquote className="mt-6">
                  <p className="text-xl font-medium text-gray-900">{testimonials[activeTestimonial].quote}</p>
                </blockquote>
                <div className="mt-6">
                  <p className="font-semibold text-gray-900">{testimonials[activeTestimonial].name}</p>
                  <p className="text-gray-600">{testimonials[activeTestimonial].role}</p>
                </div>
              </div>

              <div className="mt-10 flex justify-center space-x-3">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`h-3 w-3 rounded-full ${activeTestimonial === index ? "bg-blue-600" : "bg-gray-300"}`}
                    onClick={() => setActiveTestimonial(index)}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="bg-white py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Contact Us</h2>
                <p className="mt-4 text-lg text-gray-600">
                  Have questions or ready to schedule your appointment? Reach out to us today.
                </p>

                <div className="mt-8 space-y-6">
                  <div className="flex items-center">
                    <MapPin className="h-6 w-6 text-blue-600" />
                    <span className="ml-3 text-gray-700">123 Dental Street, City, State 12345</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-6 w-6 text-blue-600" />
                    <span className="ml-3 text-gray-700">(123) 456-7890</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-6 w-6 text-blue-600" />
                    <span className="ml-3 text-gray-700">contact@dentrw.com</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-6 w-6 text-blue-600" />
                    <div className="ml-3">
                      <p className="text-gray-700">Monday - Friday: 8:00 AM - 6:00 PM</p>
                      <p className="text-gray-700">Saturday: 9:00 AM - 2:00 PM</p>
                      <p className="text-gray-700">Sunday: Closed</p>
                    </div>
                  </div>
                </div>

                <div className="mt-10">
                  <Link
                    to={isAuthenticated ? "/appointments/add" : "/register"}
                    className="inline-flex items-center rounded-md bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <Calendar className="mr-2 h-5 w-5" />
                    Schedule Appointment
                  </Link>
                </div>
              </div>

              <div className="rounded-lg bg-gray-100 p-6 shadow-inner">
                <form className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                      placeholder="your.email@example.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      Phone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                      placeholder="(123) 456-7890"
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                      placeholder="How can we help you?"
                    ></textarea>
                  </div>
                  <div>
                    <button
                      type="submit"
                      className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Send Message
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div>
              <h3 className="text-2xl font-bold">dentRW</h3>
              <p className="mt-4 text-gray-400">
                Providing exceptional dental care for the whole family. Your smile is our priority.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Quick Links</h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <a href="#services" className="text-gray-400 hover:text-white">
                    Services
                  </a>
                </li>
                <li>
                  <a href="#about" className="text-gray-400 hover:text-white">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#team" className="text-gray-400 hover:text-white">
                    Our Team
                  </a>
                </li>
                <li>
                  <a href="#contact" className="text-gray-400 hover:text-white">
                    Contact
                  </a>
                </li>
                <li>
                  <Link to="/terms" className="text-gray-400 hover:text-white">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Connect With Us</h3>
              <div className="mt-4 flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">Instagram</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400">&copy; {new Date().getFullYear()} dentRW. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
