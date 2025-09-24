import { Upload, X } from "lucide-react";
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
  fileInputRef
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
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Foto Produk (Maks. 3)
        </label>
        <div className="flex flex-wrap items-center gap-4">
          {/* Preview untuk gambar yang dipilih */}
          {newPost.images.map((file, index) => (
            <div key={index} className="relative w-24 h-24">
              <img
                src={URL.createObjectURL(file)}
                alt={`preview ${index}`}
                className="w-full h-full object-cover rounded-lg border"
              />
              <button
                onClick={() => {
                  const updatedImages = newPost.images.filter(
                    (_, i) => i !== index
                  );
                  setNewPost({
                    ...newPost,
                    images: updatedImages,
                  });
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                aria-label="Hapus gambar"
              >
                <X size={12} />
              </button>
            </div>
          ))}

          {/* Tombol untuk menambah gambar */}
          {newPost.images.length < 3 && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:border-emerald-500 hover:text-emerald-500 transition-colors"
            >
              <Upload size={24} />
              <span className="text-xs mt-1">Tambah Foto</span>
            </button>
          )}
        </div>
        {/* Input file yang sebenarnya, disembunyikan */}
        <input
          type="file"
          ref={fileInputRef}
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files) {
              const filesArray = Array.from(e.target.files);
              setNewPost((prev) => ({
                ...prev,
                images: [...prev.images, ...filesArray].slice(0, 3),
              }));
              // Reset value agar bisa memilih file yang sama lagi setelah dihapus
              e.target.value = null;
            }
          }}
        />
      </div>
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
