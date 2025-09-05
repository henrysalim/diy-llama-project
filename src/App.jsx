import { useState } from "react";
import Home from "./pages/Home";
import About from "./pages/About";
import Creators from "./pages/Creators";
import Navbar from "./components/Navbar";

export default function App() {
  const [activePage, setActivePage] = useState("Home");

  // A simple function to render page content based on the active page
  const renderPageContent = () => {
    switch (activePage) {
      case "Home":
        return <Home />;
      case "About FeiCraft":
        return <About />;
      case "Creators":
        return <Creators />;
      default:
        return (
          <div className="text-center">
            <h1 className="text-4xl font-bold">Home</h1>
          </div>
        );
    }
  };

  return (
    // The main container for the entire app
    <div className="h-screen bg-orange-50 dark:bg-stone-900 text-stone-800 dark:text-stone-200 font-sans flex flex-col transition-colors duration-300">
      <Navbar activePage={activePage} setActivePage={setActivePage} />

      {/* Main content area */}
      <main className="flex-grow flex items-center justify-center pt-16">
        {renderPageContent()}
      </main>
    </div>
  );
}
