import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import ChatFeiCraft from "./pages/ChatFeiCraft";
import WorkshopMode from "./pages/WorkshopMode";

import { useEffect, useState } from "react";
import { supabase } from "./auth/supabase";
import DIYCommunity from "./pages/DIYCommunity";

export default function App() {
  const [activePage, setActivePage] = useState("Home");
  const [session, setSession] = useState(null);

  useEffect(() => {
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) console.error(error.message);
      else {
        setSession(data.user?.identities[0].identity_data ?? null);
      }
    };

    getSession();
  }, []);

  useEffect(() => {
    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session?.user.identities[0].identity_data ?? null); // ✅ update state whenever session changes
      }
    );

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, []);

  // A simple function to render page content based on the active page
  const renderPageContent = () => {
    switch (activePage) {
      case "Home":
        return <Home session={session} />;
      case "ChatFeiCraft":
        return <ChatFeiCraft />;
      case "WorkshopMode":
        return <WorkshopMode />;
      case "Community":
        return <DIYCommunity />;
      default:
        return (
          <div className="text-center">
            <h1 className="text-4xl font-bold">Not Found</h1>
          </div>
        );
    }
  };

  return (
    <div className="h-screen pb-24 bg-stone-50 dark:bg-stone-900 text-stone-800 dark:text-stone-200 font-sans flex flex-col transition-colors duration-300">
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
