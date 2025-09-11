import { useState } from "react";

const ImageChatResponse = ({ response, onClear }) => {
  const [copySuccess, setCopySuccess] = useState("");

  // 1. Create a new DOMParser instance
  const parser = new DOMParser();
  // 2. Parse the XML string into a document object
  const xmlDoc = parser.parseFromString(response, "application/xml");

  const handleCopy = () => {
    // Using document.execCommand for broader compatibility within iFrames
    const textArea = document.createElement("textarea");
    textArea.value = response;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand("copy");
      setCopySuccess("Copied!");
      setTimeout(() => setCopySuccess(""), 2000); // Reset message after 2 seconds
    } catch (err) {
      setCopySuccess("Failed to copy");
    }
    document.body.removeChild(textArea);
  };

  return (
    <div className="w-full max-w-2xl p-6 bg-white dark:bg-stone-800 rounded-2xl shadow-lg border border-stone-200 dark:border-stone-700 animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-stone-800 dark:text-white">
          Analysis Result
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 text-sm font-medium text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-700 rounded-md hover:bg-stone-200 dark:hover:bg-stone-600 transition-colors"
          >
            {copySuccess || "Copy"}
          </button>
          <button
            onClick={onClear}
            className="px-3 py-1.5 text-sm font-medium text-red-500 bg-red-100 dark:bg-red-900/50 dark:text-red-400 rounded-md hover:bg-red-200 dark:hover:bg-red-900/80 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>
      <div className="p-4 bg-stone-50 dark:bg-stone-900 rounded-lg max-h-96 overflow-y-auto">
        <div className="text-stone-700 dark:text-stone-200 whitespace-pre-wrap font-sans text-base">
          {xmlDoc.textContent}
        </div>
      </div>
    </div>
  );
};

export default ImageChatResponse;
