import { useEffect, useRef, useState } from "react";
import ImageInputForm from "../components/ImageInputForm";

const Home = () => {
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const fileInputRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiResponse, setApiResponse] = useState("");

  useEffect(() => {
    return () => {
      imagePreviews.forEach((file) => URL.revokeObjectURL(file));
    };
  }, [imagePreviews]);

  const handleImageChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const newPreviews = filesArray.map((file) => URL.createObjectURL(file));

      setImageFiles((prevImages) => [...prevImages, ...filesArray]);
      setImagePreviews((prevPreviews) => [...prevPreviews, ...newPreviews]);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  const handleRemoveImage = (indexToRemove) => {
    setImagePreviews((prevPreviews) => {
      URL.revokeObjectURL(prevPreviews[indexToRemove]);
      return prevPreviews.filter((_, index) => index !== indexToRemove);
    });

    setImageFiles((prevFiles) => {
      return prevFiles.filter((_, index) => index !== indexToRemove);
    });
  };

  const clearAllImages = () => {
    imagePreviews.forEach((file) => URL.revokeObjectURL(file));
    setImageFiles([]);
    setImagePreviews([]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (imageFiles.length === 0 && isSubmitting) return;

    setIsSubmitting(true);
    setApiResponse("");

    try {
      // convert images to base64
      const base64images = await Promise.all(
        imageFiles.map((file) => fileToBase64(file))
      );

      const apiKey = import.meta.env.VITE_LLAMA_API_KEY;

      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            // "HTTP-Referer": "<YOUR_SITE_URL>", // Optional. Site URL for rankings on openrouter.ai.
            // "X-Title": "<YOUR_SITE_NAME>", // Optional. Site title for rankings on openrouter.ai.
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "meta-llama/llama-4-maverick",
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: prompt || "Apakah Anda bisa melihat gambar berikut?",
                  },
                  ...base64images.map((imageBase64) => ({
                    type: "image_url",
                    image_url: {
                      url: imageBase64,
                    },
                  })),
                ],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error.message || "API Request Failed");
      }

      const data = await response.json();
      console.log(data);
      // const message = data.choices[0].message.content;
      // setApiResponse(message);
    } catch (error) {
      console.error("Error calling OpenRouter API: ", error);
      setApiResponse(`Error: ${error.message}`);
    } finally {
      clearAllImages();
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-grow flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-6xl font-extrabold text-stone-800 dark:text-white">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600">
            Hello, Creator!
          </span>
        </h1>
        <p className="mt-4 text-lg text-stone-600 dark:text-stone-300">
          How can I help you today?
        </p>
      </div>
      <ImageInputForm
        imageFiles={imageFiles}
        imagePreviews={imagePreviews}
        fileInputRef={fileInputRef}
        handleRemoveImage={handleRemoveImage}
        handleSubmit={handleSubmit}
        handleImageChange={handleImageChange}
        triggerFileSelect={triggerFileSelect}
      />
    </div>
  );
};

export default Home;
