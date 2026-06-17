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
      link: "insurance",
      label: "Insurance",
    },
    {
      id: 4,
      link: "team",
      label: "Team",
    },
    {
      id: 5,
      link: "contact",
      label: "Book Now",
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
        className="flex items-center whitespace-nowrap   cursor-pointer text-2xl font-bold text-blue-900"
        smooth={true}
        duration={500}
        onClick={scrollToTop}
      >
        {" "}
        <span className="mr-1 text-xl text-blue-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="30"
            height="28"
            fill="none"
          >
            <path
              d="M9.19807 4.45825C8.55418 4.22291 7.94427 4 7 4C5 4 4 6 4 8.5C4 10.0985 4.40885 11.0838 4.83441 12.1093C5.0744 12.6877 5.31971 13.2788 5.5 14C5.649 14.596 5.7092 15.4584 5.77321 16.3755C5.92401 18.536 6.096 21 7.5 21C8.39898 21 8.79286 19.5857 9.22652 18.0286C9.75765 16.1214 10.3485 14 12 14C13.6515 14 14.2423 16.1214 14.7735 18.0286C15.2071 19.5857 15.601 21 16.5 21C17.904 21 18.076 18.536 18.2268 16.3755C18.2908 15.4584 18.351 14.596 18.5 14C18.6803 13.2788 18.9256 12.6877 19.1656 12.1093C19.5912 11.0838 20 10.0985 20 8.5C20 6 19 4 17 4C16.0557 4 15.4458 4.22291 14.8019 4.45825C14.082 4.72136 13.3197 5 12 5C10.6803 5 9.91796 4.72136 9.19807 4.45825Z"
              stroke="#1E3A8A"
              strokeWidth="0.812"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        DentRW
      </Link>

      <nav className="hidden md:block">
        <ul className="flex items-center space-x-6">
          {links.map(({ id, link, label }) => (
            <li key={id}>
              <Link
                to={link}
                className={`cursor-pointer font-semibold hover:text-blue-400 ${
                  showNavbar ? "text-blue-600" : "text-blue-900"
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
            className={`h-6 w-6 font-semibold  text-blue-900 ${
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
          <ul className="absolute top-14 right-0 z-50 w-48 py-2 bg-white border border-gray-300 rounded shadow-md">
            {links.map(({ id, link, label }) => (
              <li key={id}>
                <Link
                  to={link}
                  className="block px-4 py-2 font-semibold mt-1 text-blue-900 hover:text-blue-500"
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
