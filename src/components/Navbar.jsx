import { useState } from "react";
import FeiCraftLogo from "./FeiCraftLogo";
import CloseMenuIcon from "./CloseMenuIcon";
import MenuIcon from "./MenuIcon";
import { createClient } from "@supabase/supabase-js";

const Navbar = ({ activePage, setActivePage }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navLinks = ["Home", "ChatFeiCraft", "About FeiCraft", "Creators"];
  const supabase = createClient(
    process.env.NODE_ENV === "development"
      ? import.meta.env.VITE_SUPABASE_URL
      : process.env.VITE_PUBLIC_SUPABASE_URL,
    process.env.NODE_ENV === "development"
      ? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
      : process.env.SUPABASE_ANON_KEY
  );

  const NavLink = ({ pageName }) => (
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        setActivePage(pageName);
        setIsMenuOpen(false);
      }}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
        activePage === pageName
          ? "bg-emerald-800 text-white"
          : "text-stone-600 dark:text-stone-300 hover:bg-emerald-600 hover:text-white"
      }`}
    >
      {pageName}
    </a>
  );

  const handleSignInGoogle = async () => {
    return supabase.auth.signInWithOAuth({
      provider: "google",
    });
  };

  const handleAfterSignIn = async (request) => {
    const { searchParams, orgin } = new URL(request.url);
    const code = searchParams.get("code");
    // if "next" is in param, use it as the redirect URL
    let next = searchParams.get("next") ?? "/";
    if (!next.startsWith("/")) {
      // if "next" is not a relative URL, use the default
      next = "/";
    }

    if (code) {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error) {
        const forwardedHost = request.headers.get("x-forwarded-host");
        const isLocalEnv = process.env.NODE_ENV === "development";

        if (isLocalEnv) {
          const redirectUrl = origin + next;

          return (window.location.href = redirectUrl);
        } else if (forwardedHost) {
          return (window.location.href = `https://${forwardedHost}/${next}`);
        } else {
          return (window.location.href = `${origin}${next}`);
        }
      }
    }

    return (window.location.href = `${origin}/auth/auth-code-error`);
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
              {navLinks.map((link) => (
                <NavLink key={link} pageName={link} />
              ))}
              <a
                href="#"
                onClick={handleSignInGoogle}
                className={`px-3 py-2 rounded-md text-sm font-bold transition-colors duration-200 text-stone-600 dark:text-stone-300 hover:text-emerald-600`}
              >
                Login
              </a>
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
            {navLinks.map((link) => (
              <NavLink key={link} pageName={link} />
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
