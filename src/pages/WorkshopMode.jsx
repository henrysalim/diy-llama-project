import { useState } from "react";

const WorkshopMode = () => {
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");

  const apiKey = `${import.meta.env.VITE_LLAMA_API_KEY}`;

  // Ambil tutorial step-by-step dari LLaMA API
  const generateWorkshop = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setSteps([]);
    setCurrentStep(0);

    try {
      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "meta-llama/llama-4-maverick",
            messages: [
              {
                role: "system",
                content:
                  "You are FeiCraft, an AI DIY tutor. Always explain projects as numbered steps (Step 1, Step 2, ...).",
              },
              {
                role: "user",
                content: `Buatkan tutorial step by step untuk DIY: ${input}`,
              },
            ],
          }),
        }
      );

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content || "";

      // Pisahkan step berdasarkan baris bernomor
      const parsedSteps = text
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => /^(\d+\.|Step\s*\d+)/i.test(line));

      setSteps(parsedSteps);
    } catch (err) {
      console.error("Error:", err);
      setSteps(["⚠️ Gagal memuat tutorial."]);
    }

    setLoading(false);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) setCurrentStep((s) => s + 1);
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4">
      {/* Header */}
      <h1 className="text-3xl font-extrabold text-center text-stone-800 dark:text-white mb-4">
        🎨 Workshop Mode
      </h1>
      <p className="text-center text-stone-600 dark:text-stone-300 mb-6">
        Masukkan ide DIY → dapatkan tutorial step-by-step interaktif
      </p>

      {/* Input */}
      <div className="flex gap-2 mb-6">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Contoh: DIY rak buku dari kardus bekas"
          className="flex-1 p-2 rounded-xl border border-stone-300 dark:bg-stone-700 dark:text-white"
        />
        <button
          onClick={generateWorkshop}
          disabled={loading}
          className="px-4 py-2 bg-emerald-500 text-white rounded-xl shadow hover:bg-emerald-600 disabled:opacity-50"
        >
          {loading ? "⏳..." : "Buat"}
        </button>
      </div>

      {/* Workshop Steps */}
      {steps.length > 0 && (
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-full bg-white dark:bg-stone-800 p-6 rounded-2xl shadow-md text-center">
            <h2 className="text-xl font-bold mb-4">
              {steps[currentStep] || "Selesai 🎉"}
            </h2>

            <div className="flex justify-between mt-6">
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className="px-4 py-2 bg-gray-300 dark:bg-stone-600 rounded-xl disabled:opacity-40"
              >
                ⬅ Prev
              </button>
              <p className="text-sm text-stone-500 dark:text-stone-400">
                Step {currentStep + 1} / {steps.length}
              </p>
              <button
                onClick={nextStep}
                disabled={currentStep === steps.length - 1}
                className="px-4 py-2 bg-emerald-500 text-white rounded-xl shadow hover:bg-emerald-600 disabled:opacity-40"
              >
                Next ➡
              </button>
            </div>
          </div>
        </div>
      )}

      {steps.length === 0 && !loading && (
        <p className="text-center text-stone-400">
          💡 Coba masukkan ide DIY untuk mulai workshop.
        </p>
      )}
    </div>
  );
};

export default WorkshopMode;
