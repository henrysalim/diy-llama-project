import { useState, useRef } from "react";
import ImageIcon from "../components/ImageIcon";
import SendIcon from "../components/SendIcon";

const InputForm = () => {
  const [imageFile, setImageFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!imageFile) {
      console.log("No image selected");
      return;
    }
    console.log("Submitting Image:", imageFile);
    setImageFile(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-700 rounded-2xl shadow-lg p-2 flex items-center space-x-2 transition-all duration-300 focus-within:ring-2 focus-within:ring-blue-500"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageChange}
          className="hidden"
          accept="image/*"
        />

        <button
          type="button"
          onClick={triggerFileSelect}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <ImageIcon />
        </button>

        <div
          className="flex-1 text-gray-500 dark:text-gray-400 cursor-pointer truncate"
          onClick={triggerFileSelect}
        >
          {imageFile ? imageFile.name : "Upload an image..."}
        </div>

        <button
          type="submit"
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!imageFile}
        >
          <SendIcon />
        </button>
      </form>
      <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2 px-4">
        FeiCraft may display inaccurate info, including about people, so
        double-check its responses.
      </p>
    </div>
  );
};

export default InputForm;
