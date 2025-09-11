import { useEffect, useRef, useState } from "react";
import ImageInputForm from "../components/ImageInputForm";
import { supabase } from "../auth/supabase";
import Login from "./Login";
import LoadingSpinner from "../components/LoadingSpinner";
import imagePrompt from "../prompt/imagePrompt";
import ImageChatResponse from "../components/ImageChatResponse";

const Home = ({ session }) => {
  const [imageFile, setImageFile] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const fileInputRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiResponse, setApiResponse] = useState("");
  let filePath;

  const getUser = async () => {
    return await supabase.auth.getUser();
  };

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

  const clearData = () => {
    if (imagePreview && imageFile) {
      setImageFile("");
      setImagePreview("");
    }
  };

  const uploadImage = async (file) => {
    // 1. Get the logged-in user
    const {
      data: { user },
      error: userError,
    } = await getUser();

    if (userError || !user) {
      console.error("No logged-in user:", userError);
      return null;
    }

    // 2. Build a unique path in the bucket
    filePath = `${user.id}/${Date.now()}-${file.name}`;

    // 3. Upload the file
    const { error: uploadError } = await supabase.storage
      .from("images")
      .upload(filePath, file);

    if (uploadError) {
      console.error("Upload failed:", uploadError.message);
      return null;
    }

    return filePath;
  };

  const getPublicUrl = async () => {
    const { data, error } = await supabase.storage
      .from("images")
      .createSignedUrl(filePath, 60 * 60); // 1 hour

    if (error) console.error(error);

    return data.signedUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (imageFile.length === 0 && isSubmitting) return;

    setIsSubmitting(true);
    setApiResponse("");

    try {
      await uploadImage(imageFile);
      const apiKey = `${import.meta.env.VITE_LLAMA_API_KEY}`;
      const publicUrl = await getPublicUrl();

      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "HTTP-Referer": "https://diy-llama-project.vercel.app",
            "X-Title": "DIY Llama Project",
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
                    text: imagePrompt,
                  },
                  {
                    type: "image_url",
                    image_url: {
                      url: `${publicUrl}`,
                    },
                  },
                ],
              },
            ],
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error.message || "API Request Failed");
      }

      const message = data.choices[0].message.content;
      setApiResponse(message);
      console.log(message);
    } catch (error) {
      console.error("Error calling OpenRouter API: ", error.message);
      setApiResponse(`Error: ${error.message}`);
    } finally {
      clearData();
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
          {session != null
            ? "How can I help you today?"
            : "Please login first to continue"}
        </p>
      </div>
      {isSubmitting ? (
        <LoadingSpinner />
      ) : apiResponse && !isSubmitting ? (
        <ImageChatResponse response={apiResponse} onClear={clearData} />
      ) : session != null ? (
        <ImageInputForm
          imageFiles={imageFile}
          imagePreviews={imagePreview}
          fileInputRef={fileInputRef}
          isSubmitting={isSubmitting}
          handleRemoveImage={handleRemoveImage}
          handleSubmit={handleSubmit}
          handleImageChange={handleImageChange}
          triggerFileSelect={triggerFileSelect}
        />
      ) : (
        <Login />
      )}
    </div>
  );
};

export default Home;
