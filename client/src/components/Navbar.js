import React, { useState, useEffect } from "react";
import { Link, animateScroll as scroll } from "react-scroll";

const Navbar = () => {
  const [showNavbar, setShowNavbar] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setShowNavbar(true);
      } else {
        setShowNavbar(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = [
    {
      id: 1,
      link: "home",
      label: "Home",
    },
    {
      id: 2,
      link: "service",
      label: "Services",
    },
    {
      id: 3,
      link: "portfolio",
      label: "Portfolio",
    },
    {
      id: 4,
      link: "experience",
      label: "Experience",
    },
    {
      id: 5,
      link: "contact",
      label: "Contact",
    },
  ];

  const scrollToTop = () => {
    scroll.scrollToTop();
  };

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  return (
    <header
      className={`fixed w-full flex items-center justify-between px-4 py-3 text-blue-900 transition-all ${
        showNavbar ? "bg-white shadow-md" : ""
      }`}
      style={{ zIndex: showMenu ? 999 : "10" }}
    >
      <Link
        to="home"
        className="cursor-pointer text-2xl font-bold text-blue-900"
        smooth={true}
        duration={500}
        onClick={scrollToTop}
      >
        DentRW
      </Link>

      <nav className="hidden md:block">
        <ul className="flex items-center space-x-6">
          {links.map(({ id, link, label }) => (
            <li key={id}>
              <Link
                to={link}
                className={`cursor-pointer hover:text-blue-500 ${
                  showNavbar ? "text-blue-900" : "text-blue-400"
                }`}
                smooth={true}
                duration={500}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="md:hidden">
        <button
          className="flex items-center focus:outline-none"
          onClick={toggleMenu}
        >
          <svg
            className={`h-6 w-6 text-blue-900 ${
              showNavbar ? "text-blue-900" : "text-blue-400"
            }`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        {showMenu && (
          <ul className="absolute top-12 right-0 z-50 w-48 py-2 bg-white border border-gray-300 rounded shadow-md">
            {links.map(({ id, link, label }) => (
              <li key={id}>
                <Link
                  to={link}
                  className="block px-4 py-2 text-blue-900 hover:text-blue-500"
                  smooth={true}
                  duration={500}
                  onClick={toggleMenu}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </header>
  );
};

export default Navbar;
