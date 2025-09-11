import { X } from "lucide-react";
import CommunityModalLayout from "./Layout/CommunityModalLayout";

const CreatePost = ({
  setShowCreatePost,
  difficultyLevels,
  loading,
  resetForms,
  newPost,
  setNewPost,
  categories,
  handleCreate,
}) => (
  <CommunityModalLayout>
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-xl font-bold">✨ Posting Karya DIY</h3>
      <button onClick={() => setShowCreatePost(false)}>
        <X size={24} />
      </button>
    </div>
    <div className="space-y-4">
      <input
        type="text"
        value={newPost.title}
        onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
        placeholder="Judul Karya"
        className="w-full p-3 border rounded-lg"
      />
      <textarea
        value={newPost.description}
        onChange={(e) =>
          setNewPost({ ...newPost, description: e.target.value })
        }
        placeholder="Ceritakan tentang karya..."
        rows="4"
        className="w-full p-3 border rounded-lg"
      />
      <div className="grid grid-cols-2 gap-4">
        <select
          value={newPost.category}
          onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
          className="p-3 border rounded-lg"
        >
          {categories.slice(1).map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <select
          value={newPost.difficulty}
          onChange={(e) =>
            setNewPost({ ...newPost, difficulty: e.target.value })
          }
          className="p-3 border rounded-lg"
        >
          {difficultyLevels.map((level) => (
            <option key={level.id} value={level.id}>
              {level.name}
            </option>
          ))}
        </select>
      </div>
      <input
        type="text"
        value={newPost.materials}
        onChange={(e) => setNewPost({ ...newPost, materials: e.target.value })}
        placeholder="Bahan-bahan (pisahkan dengan koma)"
        className="w-full p-3 border rounded-lg"
      />
      <input
        type="text"
        value={newPost.time_spent}
        onChange={(e) => setNewPost({ ...newPost, time_spent: e.target.value })}
        placeholder="Waktu yang dibutuhkan (contoh: 2 jam)"
        className="w-full p-3 border rounded-lg"
      />
      <textarea
        value={newPost.tutorial_steps}
        onChange={(e) =>
          setNewPost({ ...newPost, tutorial_steps: e.target.value })
        }
        placeholder="Langkah-langkah tutorial (opsional)"
        rows="3"
        className="w-full p-3 border rounded-lg"
      />
      <button
        onClick={() =>
          handleCreate("posts", newPost, resetForms, () =>
            setShowCreatePost(false)
          )
        }
        className="w-full px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
        disabled={loading}
      >
        {loading ? "Posting..." : "🚀 Posting Sekarang"}
      </button>
    </div>
  </CommunityModalLayout>
);

export default CreatePost;
