import { useEffect, useRef, useState } from "react";
import ImageInputForm from "../components/ImageInputForm";

const Home = () => {
  const [imageFile, setImageFile] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const fileInputRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiResponse, setApiResponse] = useState("");

  useEffect(() => {
    return () => {
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
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  const handleRemoveImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      URL.revokeObjectURL(imageFile);
    }
    setImageFile("");
    setImagePreview("");

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

  const clearImage = () => {
    if (imagePreview && imageFile) {
      setImageFile(URL.revokeObjectURL(imageFile));
      setImagePreview(URL.revokeObjectURL(imagePreview));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (imageFile.length === 0 && isSubmitting) return;

    setIsSubmitting(true);
    setApiResponse("");

    function getFileNameWithExtension(path) {
      const parts = path.split(/[/\\]/); // Splits by / or \
      return parts.pop(); // Returns the last part (file name with extension)
    }

    try {
      // convert images to base64
      const base64images = await fileToBase64(imageFile);

      const fileName = `${new Date().getTime()}_${imageFile.name}`;
      const { error, status } = await supabase.storage
        .from("images")
        .upload(fileName, imageFile);

      if (error) return console.error("Error: " + error.message);

      const apiKey = import.meta.env.VITE_LLAMA_API_KEY;

      if (status === 201) {
        const response = await fetch(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "HTTP-Referer": "https://diy-llama-project.vercel.app", // Optional. Site URL for rankings on openrouter.ai.
              "X-Title": "DIY Llama Project", // Optional. Site title for rankings on openrouter.ai.
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "meta-llama/llama-3.2-90b-vision-instruct",
              messages: [
                {
                  role: "user",
                  content: [
                    {
                      type: "text",
                      text: "Apakah Anda bisa melihat gambar berikut? Coba jelaskan!",
                    },
                    {
                      type: "image_url",
                      image_url: {
                        url: base64images,
                      },
                    },
                  ],
                },
              ],
            }),
          }
        );
      }

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
      clearImage();
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
        imageFiles={imageFile}
        imagePreviews={imagePreview}
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
