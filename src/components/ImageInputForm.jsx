import SendIcon from "./SendIcon";
import ImageIcon from "./ImageIcon";
import RemoveIcon from "./RemoveIcon";

const ImageInputForm = ({
  imageFiles,
  imagePreviews,
  fileInputRef,
  handleImageChange,
  triggerFileSelect,
  handleSubmit,
  handleRemoveImage,
}) => {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-stone-800 rounded-2xl shadow-lg p-2 flex items-center space-x-2 transition-all duration-300 focus-within:ring-2 focus-within:ring-emerald-500"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageChange}
          className="absolute w-px h-px p-0 overflow-hidden whitespace-nowrap border-0"
          accept="image/*"
<<<<<<< HEAD
=======
          multiple
>>>>>>> Upload chatbot code without next/prev
        />

        <button
          type="button"
          onClick={triggerFileSelect}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex-shrink-0"
        >
          <ImageIcon />
        </button>

        <div
          className={`flex-1 flex flex-wrap items-center gap-2 min-w-0 ${
<<<<<<< HEAD
            imagePreviews != "" ? "pt-1" : ""
          }`}
        >
          {imagePreviews != "" && (
            <div className="relative flex-shrink-0">
              <img
                src={imagePreviews}
                alt="Image preview"
=======
            imagePreviews.length > 0 ? "pt-1" : ""
          }`}
        >
          {imagePreviews.map((preview, index) => (
            <div key={index} className="relative flex-shrink-0">
              <img
                src={preview}
                alt={`Preview ${index}`}
>>>>>>> Upload chatbot code without next/prev
                className="h-12 w-12 object-cover rounded-md"
              />
              <button
                type="button"
<<<<<<< HEAD
                onClick={() => handleRemoveImage()}
=======
                onClick={() => handleRemoveImage(index)}
>>>>>>> Upload chatbot code without next/prev
                className="absolute -top-1 -right-1 bg-gray-600/80 rounded-full p-0.5 hover:text-red-500 transition-colors"
                aria-label="Remove image"
              >
                <RemoveIcon />
              </button>
            </div>
<<<<<<< HEAD
          )}
=======
          ))}
>>>>>>> Upload chatbot code without next/prev
          <div
            className="text-gray-500 dark:text-gray-400 cursor-text flex-1 h-12 flex items-center"
            onClick={triggerFileSelect}
          >
<<<<<<< HEAD
            {imageFiles === "" && "Upload one or more images..."}
=======
            {imageFiles.length === 0 && "Upload one or more images..."}
>>>>>>> Upload chatbot code without next/prev
          </div>
        </div>

        <button
          type="submit"
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          disabled={!imageFiles}
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

export default ImageInputForm;
