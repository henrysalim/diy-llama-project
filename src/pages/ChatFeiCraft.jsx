import { useEffect, useRef, useState } from "react";
import DIYChatbotForm from "../components/DIYChatbotForm";

const STORAGE_KEYS = {
  MSGS: "feicraft-messages",
  BADGES: "feicraft-badges",
  USED_IDEAS: "feicraft-used-ideas",
  MATERIALS: "feicraft-materials",
};

const ChatFeiCrafts = () => {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MSGS);
    return saved ? JSON.parse(saved) : [];
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [badges, setBadges] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BADGES);
    return saved ? JSON.parse(saved) : [];
  });
  const [usedIdeas, setUsedIdeas] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USED_IDEAS);
    return saved ? JSON.parse(saved) : [];
  });
  const [materials, setMaterials] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MATERIALS);
    return saved ? JSON.parse(saved) : [];
  });
  const [mood, setMood] = useState("Friendly"); // Friendly | Enthusiastic | Minimal | Mentor
  const [level, setLevel] = useState("Beginner"); // gamified level by badges
  const messagesEndRef = useRef(null);

  const apiKey = `${import.meta.env.VITE_LLAMA_API_KEY}`;

  // -------------------------
  // Utilities
  // -------------------------
  const persist = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn("Persist error", e);
    }
  };

  // update level based on number of badges
  const recomputeLevel = (badgeList) => {
    const n = badgeList.length;
    if (n >= 6) return "Master Crafter";
    if (n >= 3) return "Maker";
    return "Beginner";
  };

  // -------------------------
  // Format mixed content: paragraphs + checklist
  // Only create checklist blocks when allowChecklist === true
  // -------------------------
  const formatMixedContent = (text, allowChecklist = false) => {
    if (!text) return [];
    const lines = text
      .replace(/\r\n/g, "\n")
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    const blocks = [];
    let currentChecklist = [];
    let currentParagraph = [];

    const pushChecklist = () => {
      if (currentChecklist.length > 0) {
        // treat as checklist only if allowChecklist true
        if (allowChecklist) {
          blocks.push({
            type: "checklist",
            items: currentChecklist.map((s, i) => ({
              id: i,
              text: s.replace(/^[-*•\u2022]?\s*|\d+\.\s*/g, "").trim(),
              done: false,
            })),
          });
        } else {
          // merge into paragraph
          currentParagraph.push(
            ...currentChecklist.map((s) =>
              s.replace(/^[-*•\u2022]?\s*|\d+\.\s*/g, "").trim()
            )
          );
        }
        currentChecklist = [];
      }
    };

    const pushParagraph = () => {
      if (currentParagraph.length > 0) {
        blocks.push({
          type: "paragraph",
          content: currentParagraph.join(" "),
        });
        currentParagraph = [];
      }
    };

    for (let line of lines) {
      const looksLikeItem = /^([-*•\u2022]|\d+\.)\s*/.test(line);
      if (looksLikeItem) {
        if (currentParagraph.length > 0) pushParagraph();
        currentChecklist.push(line);
      } else {
        if (currentChecklist.length > 0) pushChecklist();
        currentParagraph.push(line);
      }
    }
    if (currentChecklist.length > 0) pushChecklist();
    if (currentParagraph.length > 0) pushParagraph();
    return blocks;
  };

  // -------------------------
  // Toggle checklist item
  // -------------------------
  const toggleChecklist = (msgIdx, blockIdx, stepId) => {
    setMessages((prev) => {
      const updated = prev.map((m, i) =>
        i === msgIdx
          ? {
              ...m,
              blocks: m.blocks.map((block, j) =>
                j === blockIdx && block.type === "checklist"
                  ? {
                      ...block,
                      items: block.items.map((step) =>
                        step.id === stepId
                          ? { ...step, done: !step.done }
                          : step
                      ),
                    }
                  : block
              ),
            }
          : m
      );

      // update progress count
      const allSteps = updated
        .flatMap((m) => m.blocks || [])
        .filter((b) => b.type === "checklist")
        .flatMap((b) => b.items);
      const done = allSteps.filter((s) => s.done).length;
      setProgress({ done, total: allSteps.length });

      // Achievement: unlock badge when certain milestones reached
      const newlyUnlocked = [];
      if (done >= 5 && !badges.includes("Craft Explorer"))
        newlyUnlocked.push("Craft Explorer");
      if (done >= 12 && !badges.includes("Master Doer"))
        newlyUnlocked.push("Master Doer");

      if (newlyUnlocked.length > 0) {
        const newBadges = [...badges, ...newlyUnlocked];
        setBadges(newBadges);
        persist(STORAGE_KEYS.BADGES, newBadges);
        // add a celebratory bot message
        updated.push({
          role: "bot",
          content: `🏅 Keren! Kamu membuka badge: ${newlyUnlocked.join(", ")}.`,
        });
        setLevel(recomputeLevel(newBadges));
      }

      persist(STORAGE_KEYS.MSGS, updated);
      return updated;
    });
  };

  // -------------------------
  // Parse materials statements from user input
  // e.g. "aku punya botol plastik, kardus dan kain bekas"
  // -------------------------
  const parseMaterialsFromText = (text) => {
    // naive approach: find segment after "punya" or "punya:"
    const match = text.match(/(?:punya|punya:)\s*(.+)$/i);
    if (!match) return [];
    const listPart = match[1];
    // split by comma or " dan " or " & "
    const parts = listPart
      .split(/\s*(?:,|dan|&)\s*/i)
      .map((p) => p.trim())
      .filter(Boolean);
    // cleanup short words
    return parts.map((p) => p.replace(/[.?!]$/, "")).filter(Boolean);
  };

  // -------------------------
  // LLaMA API call (system prompt adapted based on mood)
  // -------------------------
  const callLlamaAPI = async (userPrompt) => {
    try {
      // craft system message according to selected mood
      let styleGuide = "";
      switch (mood) {
        case "Enthusiastic":
          styleGuide =
            "Be upbeat, encouraging, and vivid. Use short energetic lines and emojis when appropriate.";
          break;
        case "Minimal":
          styleGuide =
            "Be minimal and concise. Use short sentences and avoid fluff.";
          break;
        case "Mentor":
          styleGuide =
            "Be instructive and patient, give helpful tips and safety notes.";
          break;
        default:
          styleGuide = "Be friendly, clear, and approachable.";
      }

      const systemMsg = `You are FeiCraft, an AI assistant specialized in DIY and crafts. ${styleGuide} Always focus on practical steps, materials and helpful tips. If the user asks for "langkah" or "bahan" produce clear bullet points. When possible include short 'Estimasi waktu' and 'Estimasi biaya' lines. If the question is not DIY-related, politely refuse.`;

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
              { role: "system", content: systemMsg },
              { role: "user", content: userPrompt },
            ],
          }),
        }
      );

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody?.error?.message || "API request failed");
      }
      const data = await response.json();
      return data.choices?.[0]?.message?.content || "No response.";
    } catch (err) {
      console.error("LLaMA API error:", err);
      return `⚠️ Error: ${err.message}`;
    }
  };

  // -------------------------
  // Estimator: attach time & budget tags based on heuristics
  // -------------------------
  const addEstimator = (reply) => {
    // simple heuristics
    let complexity = "Simple";
    const r = reply.toLowerCase();
    if (r.includes("cat") || r.includes("jahit") || r.includes("tenun"))
      complexity = "Medium";
    if (
      r.includes("kayu") ||
      r.includes("bor") ||
      r.includes("listrik") ||
      r.includes("lampu")
    )
      complexity = "Complex";

    const map = {
      Simple: { time: "± 20-40 menit", cost: "Rp10.000 – Rp40.000" },
      Medium: { time: "± 45-90 menit", cost: "Rp40.000 – Rp120.000" },
      Complex: { time: "1-3 jam", cost: "Rp120.000 – Rp500.000" },
    };
    const chosen = map[complexity];
    // only append if not already present
    if (!/estimasi waktu/i.test(reply) && !/estimasi biaya/i.test(reply)) {
      return `${reply}\n\n⏱ Estimasi waktu: ${chosen.time}\n💰 Estimasi biaya: ${chosen.cost}`;
    }
    return reply;
  };

  // -------------------------
  // Save & load chat history
  // -------------------------
  // Hapus semua chat (mirip GPT)
  const handleClearHistory = () => {
    if (confirm("Yakin ingin hapus semua chat ini?")) {
      setMessages([]);
    }
  };

  // Simpan ke localStorage
  const handleSaveHistory = () => {
    if (messages.length === 0) return alert("Belum ada chat.");
    const history = JSON.parse(
      localStorage.getItem("feicraft-history") || "[]"
    );
    const newHistory = [
      {
        id: Date.now(),
        date: new Date().toLocaleString(),
        messages,
      },
      ...history,
    ];
    localStorage.setItem("feicraft-history", JSON.stringify(newHistory));
    alert("✅ Riwayat chat disimpan! Lihat di menu History.");
  };

  // -------------------------
  // Main submit handler
  // -------------------------
  const handleSubmit = async (userInput) => {
    if (!userInput || !userInput.trim()) return;

    setIsSubmitting(true);
    // push user message immediately
    setMessages((prev) => {
      const next = [...prev, { role: "user", content: userInput }];
      persist(STORAGE_KEYS.MSGS, next);
      return next;
    });

    // parse materials if user declared
    const parsedMaterials = parseMaterialsFromText(userInput);
    if (parsedMaterials.length > 0) {
      const merged = Array.from(new Set([...materials, ...parsedMaterials]));
      setMaterials(merged);
      persist(STORAGE_KEYS.MATERIALS, merged);
      // give immediate feedback
      setMessages((prev) => {
        const next = [
          ...prev,
          { role: "bot", content: `✅ Aku ingat bahan: ${merged.join(", ")}.` },
        ];
        persist(STORAGE_KEYS.MSGS, next);
        return next;
      });
      setIsSubmitting(false);
      return;
    }

    // validate DIY keyword presence
    const isDIY = /(DIY|buat sendiri|kerajinan|prakarya|handmade)/i.test(
      userInput
    );
    if (!isDIY) {
      setMessages((prev) => {
        const next = [
          ...prev,
          {
            role: "bot",
            content:
              "🙏 Maaf, FeiCraft fokus ke DIY. Tambahkan kata 'DIY', 'kerajinan', atau 'handmade' ya.",
          },
        ];
        persist(STORAGE_KEYS.MSGS, next);
        return next;
      });
      setIsSubmitting(false);
      return;
    }

    // determine whether the user explicitly asked for steps/bahan (only then create checklist)
    const wantsChecklist = /(langkah|bahan|step|steps|materials?)/i.test(
      userInput
    );

    // show loading bot bubble
    setMessages((prev) => {
      const next = [...prev, { role: "bot", content: "..." }];
      persist(STORAGE_KEYS.MSGS, next);
      return next;
    });

    // include memory of materials to improve suggestion if present
    let promptWithContext = userInput;
    if (materials.length > 0) {
      promptWithContext += `\n\nContext bahan yang tersedia: ${materials.join(
        ", "
      )}. Mohon prioritaskan ide yang menggunakan bahan tersebut jika memungkinkan.`;
    }

    // call LLaMA
    let botReply = await callLlamaAPI(promptWithContext);
    // attach estimator heuristics
    botReply = addEstimator(botReply);

    // parse blocks only if wantsChecklist true
    const blocks = formatMixedContent(botReply, wantsChecklist);

    // replace loading bubble with bot reply object
    setMessages((prev) => {
      // remove last '...' item (assumes it is last)
      const withoutLoading = prev.slice(0, -1);
      const newMsg = { role: "bot", content: botReply, blocks, mood };
      const next = [...withoutLoading, newMsg];
      persist(STORAGE_KEYS.MSGS, next);
      return next;
    });

    // update progress counters (total steps)
    const allSteps = blocks
      .filter((b) => b.type === "checklist")
      .flatMap((b) => b.items || []);
    setProgress({ done: 0, total: allSteps.length });

    // if this was a randomly generated idea, mark it used (prevent repetition)
    if (
      /^DIY/i.test(userInput) ||
      /DIY/i.test(userInput) ||
      userInput.startsWith("DIY ")
    ) {
      // user explicitly requested a DIY; nothing to do
    } else {
      // check if this message came from a randomIdea invocation (we control random invocation separately)
    }

    // If bot suggests saving to gallery / workshop, unlock a badge when user uses export (we'll handle export elsewhere)
    setIsSubmitting(false);
  };

  // -------------------------
  // Random idea generator (ensures keyword DIY present and no repeats)
  // -------------------------
  const predefinedIdeas = [
    "DIY tempat pensil dari botol plastik bekas",
    "Kerajinan dinding handmade dari kardus",
    "DIY gelang rajut sederhana handmade",
    "DIY lampu hias dari sendok plastik",
    "Handmade organizer meja dari karton",
    "DIY vas bunga dari kaleng bekas",
    "DIY rak kecil dari tumpukan buku bekas (recycle)",
  ];
  const handleRandomIdea = () => {
    const pool = predefinedIdeas.filter((i) => !usedIdeas.includes(i));
    if (pool.length === 0) {
      alert("🎉 Semua ide acak sudah dicoba. Reset ide untuk memulai ulang.");
      return;
    }
    const sel = pool[Math.floor(Math.random() * pool.length)];
    // record used
    const newUsed = [...usedIdeas, sel];
    setUsedIdeas(newUsed);
    persist(STORAGE_KEYS.USED_IDEAS, newUsed);
    // ensure idea contains DIY keyword; if not, prepend
    const prompt = /DIY|kerajinan|handmade/i.test(sel) ? sel : `DIY ${sel}`;
    handleSubmit(prompt);
  };

  // -------------------------
  // Reset used ideas (optional)
  // -------------------------
  const resetIdeas = () => {
    if (!confirm("Reset daftar ide acak yang sudah dipakai?")) return;
    setUsedIdeas([]);
    persist(STORAGE_KEYS.USED_IDEAS, []);
    alert("Daftar ide acak telah di-reset.");
  };

  // -------------------------
  // Load progress & badges on mount
  // -------------------------
  useEffect(() => {
    const allSteps = messages
      .flatMap((m) => m.blocks || [])
      .filter((b) => b.type === "checklist")
      .flatMap((b) => b.items || []);
    const done = allSteps.filter((it) => it.done).length;
    setProgress({ done, total: allSteps.length });
  }, []); // eslint-disable-line

  useEffect(() => {
    setLevel(recomputeLevel(badges));
  }, [badges]);

  // useEffect(() => {
  //   messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  // }, [messages]);

  // -------------------------
  // UI: small helper renderers
  // -------------------------
  const renderMetaBadges = (msg) => {
    // detect estimasi lines
    const timeMatch = msg.content?.match(/⏱\s*Estimasi waktu:\s*([^\n]+)/i);
    const costMatch = msg.content?.match(/💰\s*Estimasi biaya:\s*([^\n]+)/i);
    return (
      <>
        {(timeMatch || costMatch) && (
          <div className="mt-2 flex gap-3 text-xs text-stone-500">
            {timeMatch && (
              <span className="px-2 py-1 bg-stone-100 rounded">{`⏱ ${timeMatch[1].trim()}`}</span>
            )}
            {costMatch && (
              <span className="px-2 py-1 bg-stone-100 rounded">{`💰 ${costMatch[1].trim()}`}</span>
            )}
          </div>
        )}
      </>
    );
  };

  // -------------------------
  // Render component
  // -------------------------
  return (
    <div className="flex flex-col h-auto bg-stone-50 dark:bg-stone-900 text-stone-800 dark:text-white">
      {/* Top navbar */}
      <header className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-4 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold">✨ FeiCraft</h1>
            <p className="text-sm opacity-90">
              AI DIY Companion — checklist, estimator, memory bahan & gamified
              journey
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs opacity-90">Level</div>
              <div className="font-semibold">{level}</div>
            </div>
            <div>
              <div className="text-xs opacity-90">Badges</div>
              <div className="flex gap-2">
                {badges.length === 0 ? (
                  <span className="text-xs opacity-80">No badges yet</span>
                ) : (
                  badges.map((b, i) => (
                    <span
                      key={i}
                      className="bg-yellow-300 text-xs px-2 py-1 rounded-full font-medium"
                    >
                      {b}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto p-6 flex flex-col gap-4">
        {/* Controls row */}
        <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
          <div className="flex gap-3 items-center">
            <button
              onClick={handleRandomIdea}
              className="px-3 py-2 bg-white dark:text-gray-900 shadow rounded-lg text-sm hover:shadow-md"
            >
              🎲 Ide Acak
            </button>
            <button
              onClick={() => {
                const sample = prompt(
                  "Masukkan bahan yang kamu punya, pisahkan koma (contoh: botol plastik, kardus)"
                );
                if (sample) {
                  // simulate user typing "aku punya ..." to trigger material memory logic
                  const text = `Aku punya ${sample}`;
                  handleSubmit(text);
                }
              }}
              className="px-3 py-2 bg-white dark:text-gray-900 shadow rounded-lg text-sm hover:shadow-md"
            >
              🔍 Tambah Bahan
            </button>
            <button
              onClick={resetIdeas}
              className="px-3 py-2 bg-white dark:text-gray-900 shadow rounded-lg text-sm hover:shadow-md"
            >
              ♻ Reset Ide
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const weekly = `🎉 Tantangan Mingguan: Buat sesuatu dari kardus bekas!`;
                alert(weekly);
              }}
              className="px-3 py-2 bg-amber-400 rounded-lg text-sm"
            >
              🎉 Weekly Challenge
            </button>
          </div>
        </div>

        {/* Materials + progress panes */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2 bg-white dark:bg-stone-800 rounded-xl p-4 shadow">
            {/* Chat window (left/main) */}
            <div className="flex flex-col h-[60vh]">
              <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-stone-400">
                    <div className="text-center">
                      <p className="text-lg">👋 Hai! Saya FeiCraft.</p>
                      <p className="text-sm mt-1">
                        Mulai dengan pertanyaan DIY atau klik Ide Acak ✨
                      </p>
                    </div>
                  </div>
                ) : (
                  messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-2xl shadow-sm text-sm whitespace-pre-wrap ${
                          msg.role === "user"
                            ? "bg-emerald-500 text-white"
                            : msg.content === "..."
                            ? "bg-stone-100 italic text-stone-500"
                            : "bg-stone-50 dark:bg-stone-700 text-stone-800 dark:text-stone-100"
                        }`}
                      >
                        {msg.blocks ? (
                          <div className="space-y-3">
                            {msg.blocks.map((block, bIdx) =>
                              block.type === "checklist" ? (
                                <div key={bIdx}>
                                  <p className="mb-1 font-semibold">
                                    📋 Langkah / Bahan
                                  </p>
                                  <ul className="space-y-1">
                                    {block.items.map((it) => (
                                      <li
                                        key={it.id}
                                        className="flex items-center gap-2"
                                      >
                                        <input
                                          type="checkbox"
                                          checked={it.done}
                                          onChange={() =>
                                            toggleChecklist(idx, bIdx, it.id)
                                          }
                                        />
                                        <span
                                          className={
                                            it.done
                                              ? "line-through text-stone-400"
                                              : ""
                                          }
                                        >
                                          {it.text}
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ) : (
                                <p key={bIdx}>{block.content}</p>
                              )
                            )}
                            {renderMetaBadges(msg)}
                          </div>
                        ) : (
                          <div>
                            <p>{msg.content}</p>
                            {renderMetaBadges(msg)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* input */}
              <div className="mt-3">
                <DIYChatbotForm
                  onSubmit={handleSubmit}
                  disabled={isSubmitting}
                  placeholder="Contoh: DIY hiasan dinding dari kardus bekas - atau ketik 'langkah' untuk minta step"
                />
              </div>
            </div>
          </div>

          {/* Right column: materials, progress, quick-actions */}
          {/* Materials + progress panes */}
          <aside className="bg-white dark:bg-stone-800 rounded-xl p-4 shadow flex flex-col gap-4">
            <div>
              <h3 className="text-sm font-semibold">
                🧰 Materials (ingat sesi)
              </h3>
              {materials.length === 0 ? (
                <p className="text-xs mt-2 text-stone-500">
                  Belum ada bahan tersimpan. Tambah via tombol "Tambah Bahan"
                  atau ketik "aku punya ..." di chat.
                </p>
              ) : (
                <div className="mt-2 flex flex-wrap gap-2">
                  {materials.map((m, i) => (
                    <span
                      key={i}
                      className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full text-xs"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              )}

              {materials.length > 0 && (
                <div className="mt-3 flex flex-col gap-2">
                  <button
                    onClick={() => {
                      const prompt = `${materials.join(
                        ", "
                      )}. Apa ide DIY yang bisa saya buat dari ini? Berikan langkahnya juga!`;
                      handleSubmit(prompt);
                    }}
                    className="px-3 py-2 bg-emerald-500 text-white rounded-md text-sm hover:bg-emerald-600"
                  >
                    ✨ Gunakan bahan ini
                  </button>
                  <button
                    onClick={() => {
                      if (!confirm("Hapus semua bahan yang tersimpan?")) return;
                      setMaterials([]);
                      persist(STORAGE_KEYS.MATERIALS, []);
                    }}
                    className="text-xs text-red-500"
                  >
                    Hapus bahan tersimpan
                  </button>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-sm font-semibold">📈 Progress</h3>
              <div className="text-xs text-stone-500 mt-1">
                {progress.done}/{progress.total} langkah selesai
              </div>
              <div className="w-full bg-stone-200 rounded-full h-2 mt-2">
                <div
                  className="bg-emerald-500 h-2 rounded-full"
                  style={{
                    width: `${
                      progress.total === 0
                        ? 0
                        : (progress.done / progress.total) * 100
                    }%`,
                  }}
                />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold">🏷 Quick Actions</h3>
              <div className="mt-2 flex flex-col gap-2">
                <button
                  onClick={handleClearHistory}
                  className="px-3 py-2 bg-red-500 text-white rounded-md text-sm"
                >
                  🗑 Hapus Semua Riwayat
                </button>

                <button
                  onClick={() => {
                    // show used ideas count
                    alert(`Ide acak terpakai: ${usedIdeas.length}`);
                  }}
                  className="px-3 py-2 bg-stone-100 text-stone-800 rounded-md text-sm"
                >
                  ℹ️ Info Ide Acak
                </button>
              </div>
            </div>
          </aside>
        </div>

        {/* Footer: small notes */}
        <div className="text-xs text-stone-500 text-center">
          <span>
            FeiCraft — fokus pada pengalaman praktis DIY: langkah nyata,
            estimasi waktu & biaya, serta ingatan bahanmu. Untuk hackathon:
            tunjukkan export Workshop, Gallery & Badges sebagai unique selling
            points.
          </span>
        </div>
      </main>
    </div>
  );
};

export default ChatFeiCrafts;
