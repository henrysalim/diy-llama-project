import { X } from "lucide-react";
import CommunityModalLayout from "./Layout/CommunityModalLayout";

const CreateWorkshop = ({
  setShowCreateWorkshop,
  newWorkshop,
  setNewWorkshop,
  categories,
  handleCreate,
  loading,
  resetForms,
}) => (
  <CommunityModalLayout>
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-xl font-bold">📺 Buat Live Workshop</h3>
      <button onClick={() => setShowCreateWorkshop(false)}>
        <X size={24} />
      </button>
    </div>
    <div className="space-y-4">
      <input
        type="text"
        value={newWorkshop.title}
        onChange={(e) =>
          setNewWorkshop({ ...newWorkshop, title: e.target.value })
        }
        placeholder="Judul Workshop"
        className="w-full p-3 border rounded-lg"
      />
      <textarea
        value={newWorkshop.description}
        onChange={(e) =>
          setNewWorkshop({
            ...newWorkshop,
            description: e.target.value,
          })
        }
        placeholder="Deskripsi workshop..."
        rows="4"
        className="w-full p-3 border rounded-lg"
      />
      <div className="grid grid-cols-2 gap-4">
        <input
          type="datetime-local"
          value={newWorkshop.scheduled_time}
          onChange={(e) =>
            setNewWorkshop({
              ...newWorkshop,
              scheduled_time: e.target.value,
            })
          }
          className="p-3 border rounded-lg"
        />
        <select
          value={newWorkshop.category}
          onChange={(e) =>
            setNewWorkshop({ ...newWorkshop, category: e.target.value })
          }
          className="p-3 border rounded-lg"
        >
          {categories.slice(1).map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <input
          type="number"
          value={newWorkshop.max_participants}
          onChange={(e) =>
            setNewWorkshop({
              ...newWorkshop,
              max_participants: e.target.value,
            })
          }
          placeholder="Maks Peserta"
          className="p-3 border rounded-lg"
        />
        <input
          type="text"
          value={newWorkshop.duration}
          onChange={(e) =>
            setNewWorkshop({ ...newWorkshop, duration: e.target.value })
          }
          placeholder="Durasi (jam)"
          className="p-3 border rounded-lg"
        />
        <input
          type="number"
          value={newWorkshop.price}
          onChange={(e) =>
            setNewWorkshop({ ...newWorkshop, price: e.target.value })
          }
          placeholder="Biaya (Rp)"
          className="p-3 border rounded-lg"
        />
      </div>
      <input
        type="text"
        value={newWorkshop.materials_needed}
        onChange={(e) =>
          setNewWorkshop({
            ...newWorkshop,
            materials_needed: e.target.value,
          })
        }
        placeholder="Bahan yang diperlukan (pisahkan dengan koma)"
        className="w-full p-3 border rounded-lg"
      />
      <input
        type="text"
        value={newWorkshop.workshop_link || ""}
        onChange={(e) =>
          setNewWorkshop({
            ...newWorkshop,
            workshop_link: e.target.value,
          })
        }
        placeholder="Link Zoom, Google Meet, Youtube, dll"
        className="w-full p-3 border rounded-lg"
      />
      <button
        onClick={() =>
          handleCreate("workshops", newWorkshop, resetForms, () =>
            setShowCreateWorkshop(false)
          )
        }
        className="w-full px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
        disabled={loading}
      >
        {loading ? "Membuat..." : "🚀 Buat Workshop"}
      </button>
    </div>
  </CommunityModalLayout>
);

export default CreateWorkshop;
