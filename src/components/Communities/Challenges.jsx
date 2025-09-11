import { Edit, Trash2, Trophy } from "lucide-react";

const Challenges = ({
  filteredChallenges,
  setEditingItem,
  currentUser,
  handleJoin,
  handleDelete,
  isUserParticipating,
}) => (
  <div className="grid md:grid-cols-2 gap-6">
    {filteredChallenges.map((challenge) => (
      <div key={challenge.id} className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-bold text-lg">{challenge.title}</h3>
          {challenge.user_id === currentUser.id && (
            <div className="flex gap-1">
              <button
                onClick={() =>
                  setEditingItem({ ...challenge, type: "challenges" })
                }
                className="p-1 text-blue-500 hover:text-blue-700"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => handleDelete("challenges", challenge.id)}
                className="p-1 text-red-500 hover:text-red-700"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>
        <p className="text-sm text-stone-600 mb-3">{challenge.description}</p>
        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div>
            <div className="text-stone-500">Hadiah</div>
            <div className="font-medium text-green-600">{challenge.prize}</div>
          </div>
          <div>
            <div className="text-stone-500">Peserta</div>
          </div>
          <div>
            <div className="text-stone-500">Deadline</div>
            <div className="font-medium text-red-600">
              {new Date(challenge.deadline).toLocaleDateString()}
            </div>
          </div>
          <div>
            <div className="text-stone-500">Level</div>
            <div className="font-medium">{challenge.difficulty}</div>
          </div>
        </div>
        {challenge.rules && (
          <div className="text-sm mb-4">
            <div className="text-stone-500 mb-1">Aturan:</div>
            <div className="text-stone-700">{challenge.rules}</div>
          </div>
        )}
        <button
          onClick={() => handleJoin("challenge", challenge.id)}
          disabled={isUserParticipating(challenge.id, "challenge")}
          className={`w-full py-2 px-4 rounded-lg flex items-center justify-center gap-2 ${
            isUserParticipating(challenge.id, "challenge")
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-purple-500 text-white hover:bg-purple-600"
          }`}
        >
          <Trophy size={16} />
          {isUserParticipating(challenge.id, "challenge")
            ? "Sudah Bergabung"
            : "Ikut Challenge"}
        </button>
      </div>
    ))}
  </div>
);

export default Challenges;
