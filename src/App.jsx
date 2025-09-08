import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import ChatFeiCraft from "./pages/ChatFeiCraft";
import WorkshopMode from "./pages/WorkshopMode";

import { useEffect, useState } from "react";
import { supabase } from "./auth/supabase";

export default function App() {
  const [activePage, setActivePage] = useState("Home");
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Remove the hash fragment after login
    if (window.location.hash.includes("access_token")) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  // A simple function to render page content based on the active page
  const renderPageContent = () => {
    switch (activePage) {
      case "Home":
        return <Home />;
      case "ChatFeiCraft":   
        return <ChatFeiCraft />;
      case "WorkshopMode":
        return <WorkshopMode />;
      default:
        return (
          <div className="text-center">
            <h1 className="text-4xl font-bold">Home</h1>
          </div>
        );
    }
  };

  return (

    <div className="h-screen bg-orange-50 dark:bg-stone-900 text-stone-800 dark:text-stone-200 font-sans flex flex-col transition-colors duration-300">
      <Navbar
        session={session}
        activePage={activePage}
        setActivePage={setActivePage}
      />

      {}
      <main className="flex-grow flex items-center justify-center pt-16">
        {renderPageContent()}
      </main>
    </div>
  );
}
