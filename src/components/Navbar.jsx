import { useEffect, useRef, useState } from "react";
import FeiCraftLogo from "./FeiCraftLogo";
import CloseMenuIcon from "./CloseMenuIcon";
import MenuIcon from "./MenuIcon";
import { Link, useNavigate } from "react-router";
import { supabase } from "../auth/supabase";

const Navbar = ({ activePage, setActivePage, session }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navLinks = [
    { name: "Home", type: "link" },
    { name: "ChatFeiCraft", type: "link" },
    { name: "About FeiCraft", type: "link" },
    { name: session?.full_name, type: "dropdown" },
  ];
  const navigate = useNavigate();

  const NavLink = ({ pageName, isMobile = false }) => (
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        setActivePage(pageName);
        if (isMobile) setIsMenuOpen(false);
      }}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 block ${
        activePage === pageName
          ? "bg-emerald-800 text-white"
          : "text-stone-600 dark:text-stone-300 hover:bg-emerald-600 hover:text-white"
      }`}
    >
      {pageName}
    </a>
  );

  const ChevronDownIcon = ({ isOpen }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-transform duration-200 ${
        isOpen ? "rotate-180" : ""
      }`}
    >
      <path d="m6 9 6 6 6-6"></path>
    </svg>
  );

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout error:", error.message);
    } else {
      navigate("/"); // ✅ redirect after logout
    }
  };

  const Dropdown = ({ item }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Effect to close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target)
        ) {
          setIsOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`px-3 text-stone-600 dark:text-stone-300 hover:bg-emerald-600 hover:text-white cursor-pointer py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center gap-1`}
        >
          {item.name}
          <ChevronDownIcon isOpen={isOpen} />
        </button>
        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-stone-800 rounded-md shadow-lg py-1 z-20">
            <Link
              onClick={handleLogout}
              className={`block px-4 py-2 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700`}
            >
              Logout
            </Link>
          </div>
        )}
      </div>
    );
  };

  return (
    <nav className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm shadow-md fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side: Logo */}
          <div className="flex-shrink-0">
            <a
              href="#"
              onClick={() => setActivePage("Home")}
              className="flex items-center space-x-2"
            >
              <FeiCraftLogo />
              <span className="font-bold text-xl text-gray-800 dark:text-white">
                FeiCraft
              </span>
            </a>
          </div>

          {/* Right side: Desktop Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navLinks.map((item) =>
                item.type === "link" ? (
                  <NavLink key={item.name} pageName={item.name} />
                ) : (
                  session && <Dropdown key={item.name} item={item} />
                )
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? <CloseMenuIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((item) =>
              item.type === "link" ? (
                <NavLink key={item.name} pageName={item.name} />
              ) : (
                session && <Dropdown key={item.name} item={item} />
              )
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
