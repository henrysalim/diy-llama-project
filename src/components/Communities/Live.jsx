import { Clock, Edit, Eye, Flag, Trash2 } from "lucide-react";

const Live = ({
  filteredWorkshops,
  currentUser,
  setEditingItem,
  handleDelete,
  setSelectedWorkshop,
  isUserParticipating,
}) => (
  <div className="grid md:grid-cols-3 gap-4">
    {filteredWorkshops.map((workshop) => (
      <div
        key={workshop.id}
        className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-stone-500" />
            <span className="text-sm text-stone-600">
              {new Date(workshop.scheduled_time).toLocaleString()}
            </span>
          </div>
          {workshop.user_id === currentUser.id && (
            <div className="flex gap-1">
              <button
                onClick={() =>
                  setEditingItem({ ...workshop, type: "workshops" })
                }
                className="p-1 text-blue-500 hover:text-blue-700"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => handleDelete("workshops", workshop.id)}
                className="p-1 text-red-500 hover:text-red-700"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>
        <h3
          className="font-semibold mb-2 cursor-pointer hover:underline"
          onClick={() => setSelectedWorkshop(workshop)}
        >
          {workshop.title}
        </h3>
        <div className="text-sm text-stone-600 mb-3 line-clamp-2">
          {workshop.description}
        </div>
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2 py-1 bg-stone-100 rounded-full text-xs">
            {workshop.category}
          </span>
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
            {workshop.duration || "1 jam"}
          </span>
        </div>
        <div className="text-sm text-stone-500 mb-3">
          <div>Instruktur: {workshop.user_name}</div>
          {workshop.price && workshop.price !== "0" && (
            <div className="font-medium text-emerald-600">
              Biaya: Rp{Number(workshop.price).toLocaleString("id-ID")}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              if (workshop.workshop_link) {
                window.open(workshop.workshop_link, "_blank");
              }
            }}
            className={`flex-1 text-center py-2 rounded text-sm transition-colors ${
              isUserParticipating(workshop.id, "workshop")
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-red-500 text-white hover:bg-red-600"
            }`}
          >
            {isUserParticipating(workshop.id, "workshop")
              ? "Terdaftar"
              : "Gabung Live"}
          </button>
          <button
            onClick={() => setSelectedWorkshop(workshop)}
            className="px-3 py-2 bg-stone-100 hover:bg-stone-200 rounded text-sm"
          >
            <Eye size={16} />
          </button>

          <button className="flex float-right items-center gap-1 text-stone-500 hover:text-red-500">
            <Flag size={12} />
          </button>
        </div>
      </div>
    ))}
  </div>
);

export default Live;
