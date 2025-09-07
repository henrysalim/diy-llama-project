import { useState } from "react";
import Home from "./pages/Home";
import About from "./pages/About";
import Creators from "./pages/Creators";
import Navbar from "./components/Navbar";
import ChatFeiCraft from "./pages/ChatFeiCraft";
import WorkshopMode from "./pages/WorkshopMode";


export default function App() {
  const [activePage, setActivePage] = useState("Home");
  const renderPageContent = () => {
    switch (activePage) {
      case "Home":
        return <Home />;
      case "ChatFeiCraft":   
        return <ChatFeiCraft />;
      case "WorkshopMode":
        return <WorkshopMode />;
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

    <div className="h-screen bg-orange-50 dark:bg-stone-900 text-stone-800 dark:text-stone-200 font-sans flex flex-col transition-colors duration-300">
      {}
      <Navbar activePage={activePage} setActivePage={setActivePage} />

      {}
      <main className="flex-grow flex items-center justify-center pt-16">
        {renderPageContent()}
      </main>
    </div>
  );
}
