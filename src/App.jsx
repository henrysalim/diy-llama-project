import { useState } from "react";
import Home from "./pages/Home";
import About from "./pages/About";
import Creators from "./pages/Creators";
import Navbar from "./components/Navbar";
<<<<<<< HEAD
=======
import ChatFeiCraft from "./pages/ChatFeiCraft";
import WorkshopMode from "./pages/WorkshopMode";

>>>>>>> Upload chatbot code without next/prev

export default function App() {
  const [activePage, setActivePage] = useState("Home");

<<<<<<< HEAD
  // A simple function to render page content based on the active page
=======
>>>>>>> Upload chatbot code without next/prev
  const renderPageContent = () => {
    switch (activePage) {
      case "Home":
        return <Home />;
<<<<<<< HEAD
      case "About FeiCraft":
        return <About />;
=======
      case "ChatFeiCraft":   
        return <ChatFeiCraft />;
      case "WorkshopMode":
        return <WorkshopMode />;
>>>>>>> Upload chatbot code without next/prev
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
<<<<<<< HEAD
    // The main container for the entire app
    <div className="h-screen bg-orange-50 dark:bg-stone-900 text-stone-800 dark:text-stone-200 font-sans flex flex-col transition-colors duration-300">
      <Navbar activePage={activePage} setActivePage={setActivePage} />

      {/* Main content area */}
=======
    <div className="h-screen bg-orange-50 dark:bg-stone-900 text-stone-800 dark:text-stone-200 font-sans flex flex-col transition-colors duration-300">
      {}
      <Navbar activePage={activePage} setActivePage={setActivePage} />

      {}
>>>>>>> Upload chatbot code without next/prev
      <main className="flex-grow flex items-center justify-center pt-16">
        {renderPageContent()}
      </main>
    </div>
  );
}
