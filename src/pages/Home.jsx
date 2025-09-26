import { useEffect, useRef, useState } from "react";
import ImageInputForm from "../components/ImageInputForm";
import { supabase } from "../auth/supabase";
import Login from "./Login";
import LoadingSpinner from "../components/LoadingSpinner";
import { imagePrompt } from "../prompt/imagePrompt";
import { Copy, Trash2, User, Sparkles } from "lucide-react";

const Home = ({ session }) => {
  const [imageFile, setImageFile] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const fileInputRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);
  const [responseData, setResponseData] = useState(null);
  const [error, setError] = useState(null);

  const getUser = async () => {
    return await supabase.auth.getUser();
  };

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  useEffect(() => {
    // Parse API response when it changes
    if (apiResponse) {
      try {
        if (typeof apiResponse === "string") {
          const parsed = JSON.parse(apiResponse);
          setResponseData(parsed);
        } else {
          setResponseData(apiResponse);
        }
        setError(null);
      } catch (e) {
        console.error("Failed to parse API response:", e);
        setResponseData(null);
        setError("Failed to process the response. Please try again.");
      }
    }
  }, [apiResponse]);

  const handleImageChange = (e) => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);

    if (e.target.files && e.target.files[0]) {
      const fileImage = e.target.files[0];
      const newPreview = URL.createObjectURL(fileImage);

      setImageFile(fileImage);
      setImagePreview(newPreview);
      setError(null);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  const handleRemoveImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile("");
    setImagePreview("");
    setError(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const clearData = () => {
    setImageFile("");
    setImagePreview("");
    setApiResponse(null);
    setResponseData(null);
    setError(null);
  };

  const copyResponse = async () => {
    if (!apiResponse) return;
    try {
      const textToCopy =
        typeof apiResponse === "string"
          ? apiResponse
          : JSON.stringify(apiResponse, null, 2);
      await navigator.clipboard.writeText(textToCopy);
      alert("✅ Copied to clipboard!");
    } catch (err) {
      console.error("Copy failed", err);
      alert("❌ Failed to copy to clipboard");
    }
  };

  const uploadImage = async (file) => {
    const {
      data: { user },
      error: userError,
    } = await getUser();

    if (userError || !user) {
      console.error("No logged-in user:", userError);
      setError("Please login to upload images");
      return null;
    }

    const filePath = `${user.id}/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("images")
      .upload(filePath, file);

    if (uploadError) {
      console.error("Upload failed:", uploadError.message);
      setError("Image upload failed. Please try again.");
      return null;
    }

    return filePath;
  };

  const getPublicUrl = async (filePath) => {
    const { data, error } = await supabase.storage
      .from("images")
      .createSignedUrl(filePath, 60 * 60);

    if (error) {
      console.error(error);
      setError("Failed to generate image URL");
      return null;
    }

    return data.signedUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile || isSubmitting) return;

    setIsSubmitting(true);
    setApiResponse(null);
    setResponseData(null);
    setError(null);

    try {
      const uploadedFilePath = await uploadImage(imageFile);
      if (!uploadedFilePath) {
        setIsSubmitting(false);
        return;
      }

      const apiKey = `${import.meta.env.VITE_LLAMA_API_KEY}`;
      const publicUrl = await getPublicUrl(uploadedFilePath);
      if (!publicUrl) {
        setIsSubmitting(false);
        return;
      }

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
            model: "meta-llama/llama-4-scout",
            messages: [
              {
                role: "user",
                content: [
                  { type: "text", text: imagePrompt },
                  { type: "image_url", image_url: { url: `${publicUrl}` } },
                ],
              },
            ],
            max_tokens: 3000,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || "API Request Failed");
      }

      let rawContent = data.choices[0].message.content;
      let messageContent = Array.isArray(rawContent)
        ? rawContent.map((part) => part.text || part).join("\n")
        : rawContent;

      setApiResponse(messageContent);
    } catch (error) {
      console.error("Error calling OpenRouter API: ", error.message);
      setError(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-grow flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-6xl font-extrabold text-stone-800 dark:text-white">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600">
            Hello, Creator! 👋
          </span>
        </h1>
        <p className="mt-4 text-lg text-stone-600 dark:text-stone-300">
          {session != null
            ? "How can I help you today? 🛠️"
            : "Please login first to continue 🔐"}
        </p>
      </div>

      {error && (
        <div className="w-full max-w-2xl bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-2xl p-4 mb-6">
          <p className="text-red-700 dark:text-red-300">❌ {error}</p>
        </div>
      )}

      {isSubmitting ? (
        <div className="flex flex-col items-center">
          <LoadingSpinner />
          <p className="mt-4 text-stone-600 dark:text-stone-300">
            Analyzing your image... 🔍
          </p>
        </div>
      ) : responseData ? (
        responseData.error ? (
          <div className="w-full max-w-2xl bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-2xl p-6 text-center space-y-4 animate-fadeIn">
            <h2 className="text-xl font-bold text-yellow-700 dark:text-yellow-400">
              ⚠️ Oops!
            </h2>
            <p className="text-stone-700 dark:text-stone-300">
              {responseData.error}
            </p>
            <button
              onClick={clearData}
              className="mt-4 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow transition-all hover:scale-105"
            >
              Coba Lagi
            </button>
          </div>
        ) : (
          // Tampilan normal jika hasil valid DIY
          <div className="w-full max-w-4xl bg-white dark:bg-stone-800 rounded-2xl shadow-lg p-6 space-y-6 animate-fadeIn">
            <div className="flex items-center gap-2">
              <Sparkles className="text-emerald-500" />
              <h2 className="text-2xl font-bold text-emerald-600">
                Craft Analysis Result 🎉
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-emerald-50 dark:bg-stone-700 p-4 rounded-xl">
                <h3 className="font-semibold text-emerald-700 dark:text-emerald-400 mb-2">
                  {responseData.image_content?.title || "Image Content"} 🖼️
                </h3>
                <ul className="list-disc list-inside text-stone-700 dark:text-stone-300">
                  {responseData.image_content?.items?.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-amber-50 dark:bg-stone-700 p-4 rounded-xl">
                <h3 className="font-semibold text-amber-700 dark:text-amber-400 mb-2">
                  {responseData.pricing?.title || "Pricing"} 💰
                </h3>
                <p className="font-bold text-lg">
                  {responseData.pricing?.range_idr}
                </p>
                <p className="text-stone-600 dark:text-stone-300 mt-2">
                  {responseData.pricing?.justification}
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-stone-700 p-4 rounded-xl">
                <h3 className="font-semibold text-blue-700 dark:text-blue-400 mb-2">
                  {responseData.estimation?.time && "⏱️ Time Estimation"}
                </h3>
                <p className="text-stone-700 dark:text-stone-300">
                  {responseData.estimation?.time}
                </p>
                <p className="text-stone-700 dark:text-stone-300 mt-2">
                  {responseData.estimation?.cost &&
                    `💵 ${responseData.estimation.cost}`}
                </p>
              </div>

              <div className="bg-purple-50 dark:bg-stone-700 p-4 rounded-xl">
                <h3 className="font-semibold text-purple-700 dark:text-purple-400 mb-2">
                  {responseData.instructions?.title || "Instructions"} 📝
                </h3>
                <ol className="list-decimal list-inside text-stone-700 dark:text-stone-300">
                  {responseData.instructions?.steps?.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <button
                onClick={copyResponse}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow transition-all hover:scale-105"
              >
                <Copy size={16} /> Copy JSON
              </button>
              <button
                onClick={clearData}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl shadow transition-all hover:scale-105"
              >
                <Trash2 size={16} /> Start Over
              </button>
            </div>
          </div>
        )
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
