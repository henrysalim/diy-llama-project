import { useState } from "react";
import SendIcon from "./SendIcon";

const DIYChatbotForm = ({ onSubmit, disabled }) => {
  const [input, setInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSubmit(input);
    setInput("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 bg-white dark:bg-stone-800 rounded-2xl shadow-lg p-2 flex items-center space-x-2"
    >
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Tulis pertanyaan DIY kamu..."
        className="flex-1 outline-none bg-transparent px-2 py-2 text-sm text-gray-800 dark:text-gray-100"
        disabled={disabled}
      />
      <button
        type="submit"
        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
        disabled={disabled}
      >
        <SendIcon />
      </button>
    </form>
  );
};

export default DIYChatbotForm;
