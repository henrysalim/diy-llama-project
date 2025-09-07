import { useState, useEffect } from "react";

export default function HistoryPage() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("feicraft-history") || "[]");
    setHistory(saved);
  }, []);

  const handleDelete = (id) => {
    if (!confirm("Hapus riwayat ini?")) return;
    const newHistory = history.filter((h) => h.id !== id);
    setHistory(newHistory);
    localStorage.setItem("feicraft-history", JSON.stringify(newHistory));
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">📜 Riwayat Chat</h1>
      {history.length === 0 && <p className="text-gray-500">Belum ada riwayat tersimpan.</p>}
      <div className="space-y-4">
        {history.map((h) => (
          <div key={h.id} className="p-4 bg-white rounded-lg shadow">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold">{h.date}</h2>
              <button
                onClick={() => handleDelete(h.id)}
                className="px-2 py-1 bg-red-500 text-white rounded-md text-sm"
              >
                ❌ Hapus
              </button>
            </div>
            <div className="mt-2 space-y-1">
              {h.messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded ${
                    m.role === "user" ? "bg-purple-50" : "bg-gray-100"
                  }`}
                >
                  <strong>{m.role === "user" ? "👤 Kamu" : "🤖 FeiCrafts"}:</strong> {m.content}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
