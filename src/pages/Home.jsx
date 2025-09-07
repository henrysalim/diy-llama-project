import { useEffect, useRef, useState } from "react";
import ImageInputForm from "../components/ImageInputForm";

const Home = () => {
<<<<<<< HEAD
  const [imageFile, setImageFile] = useState("");
  const [imagePreview, setImagePreview] = useState("");
=======
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
>>>>>>> Upload chatbot code without next/prev
  const fileInputRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiResponse, setApiResponse] = useState("");

  useEffect(() => {
    return () => {
<<<<<<< HEAD
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const handleImageChange = (e) => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);

    if (e.target.files && e.target.files[0]) {
      const fileImage = e.target.files[0];
      const newPreview = URL.createObjectURL(fileImage);

      setImageFile(fileImage);
      setImagePreview(newPreview);
=======
      imagePreviews.forEach((file) => URL.revokeObjectURL(file));
    };
  }, [imagePreviews]);

  const handleImageChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const newPreviews = filesArray.map((file) => URL.createObjectURL(file));

      setImageFiles((prevImages) => [...prevImages, ...filesArray]);
      setImagePreviews((prevPreviews) => [...prevPreviews, ...newPreviews]);
>>>>>>> Upload chatbot code without next/prev
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

<<<<<<< HEAD
  const handleRemoveImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      URL.revokeObjectURL(imageFile);
    }
    setImageFile("");
    setImagePreview("");
=======
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
>>>>>>> Upload chatbot code without next/prev

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

<<<<<<< HEAD
  const clearImage = () => {
    if (imagePreview && imageFile) {
      setImageFile(URL.revokeObjectURL(imageFile));
      setImagePreview(URL.revokeObjectURL(imagePreview));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (imageFile.length === 0 && isSubmitting) return;
=======
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (imageFiles.length === 0 && isSubmitting) return;
>>>>>>> Upload chatbot code without next/prev

    setIsSubmitting(true);
    setApiResponse("");

    try {
      // convert images to base64
<<<<<<< HEAD
      const base64images = await fileToBase64(imageFile);
=======
      const base64images = await Promise.all(
        imageFiles.map((file) => fileToBase64(file))
      );
>>>>>>> Upload chatbot code without next/prev

      const apiKey = import.meta.env.VITE_LLAMA_API_KEY;

      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
<<<<<<< HEAD
            "HTTP-Referer": "https://diy-llama-project.vercel.app", // Optional. Site URL for rankings on openrouter.ai.
            "X-Title": "DIY Llama Project", // Optional. Site title for rankings on openrouter.ai.
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "meta-llama/llama-3.2-90b-vision-instruct",
=======
            // "HTTP-Referer": "<YOUR_SITE_URL>", // Optional. Site URL for rankings on openrouter.ai.
            // "X-Title": "<YOUR_SITE_NAME>", // Optional. Site title for rankings on openrouter.ai.
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "meta-llama/llama-4-maverick",
>>>>>>> Upload chatbot code without next/prev
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "text",
<<<<<<< HEAD
                    text: "Apakah Anda bisa melihat gambar berikut? Coba jelaskan!",
                  },
                  {
                    type: "image_url",
                    image_url: {
                      url: base64images,
                    },
                  },
=======
                    text: prompt || "Apakah Anda bisa melihat gambar berikut?",
                  },
                  ...base64images.map((imageBase64) => ({
                    type: "image_url",
                    image_url: {
                      url: imageBase64,
                    },
                  })),
>>>>>>> Upload chatbot code without next/prev
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
<<<<<<< HEAD
      clearImage();
=======
      clearAllImages();
>>>>>>> Upload chatbot code without next/prev
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
<<<<<<< HEAD
        imageFiles={imageFile}
        imagePreviews={imagePreview}
=======
        imageFiles={imageFiles}
        imagePreviews={imagePreviews}
>>>>>>> Upload chatbot code without next/prev
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
