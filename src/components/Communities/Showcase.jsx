import { Flag, Heart, MessageCircle } from "lucide-react";

const Showcase = ({
  filteredPosts,
  currentUser,
  likes,
  comments,
  setSelectedPost,
  setEditingItem,
  handleLikePost,
  handleDelete,
  isPostLiked,
}) => {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredPosts.map((post) => (
        <div
          key={post.id}
          className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4"
        >
          <div className="flex items-start gap-3 mb-3">
            <div className="text-xl">{post.user_avatar}</div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium text-sm">{post.user_name}</span>
                  <div className="text-xs text-stone-500">
                    {new Date(post.created_at).toLocaleDateString()}
                  </div>
                </div>
                {post.user_id === currentUser.id && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => setEditingItem({ ...post, type: "posts" })}
                      className="p-1 text-blue-500 hover:text-blue-700"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete("posts", post.id)}
                      className="p-1 text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <h3
            className="font-semibold mb-2 text-sm cursor-pointer hover:underline"
            onClick={() => setSelectedPost(post)}
          >
            {post.title}
          </h3>
          <p className="text-xs text-stone-600 mb-3 line-clamp-2">
            {post.description}
          </p>
          <div className="flex items-center gap-2 mb-3">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                post.difficulty === "mudah"
                  ? "bg-green-100 text-green-800"
                  : post.difficulty === "sedang"
                  ? "bg-yellow-100 text-yellow-800"
                  : post.difficulty === "sulit"
                  ? "bg-red-100 text-red-800"
                  : "bg-purple-100 text-purple-800"
              }`}
            >
              {post.difficulty}
            </span>
            <span className="px-2 py-1 bg-stone-100 rounded-full text-xs">
              {post.category}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs mt-auto">
            <div className="flex gap-3">
              <button
                onClick={() => handleLikePost(post.id)}
                className={`flex items-center gap-1 transition-colors ${
                  isPostLiked(post.id)
                    ? "text-red-500"
                    : "text-stone-500 hover:text-red-400"
                }`}
              >
                <Heart
                  size={12}
                  fill={isPostLiked(post.id) ? "currentColor" : "none"}
                />
                {likes.filter((l) => l.post_id === post.id).length}
              </button>
              <button
                onClick={() => setSelectedPost(post)}
                className="flex items-center gap-1 text-stone-500 hover:text-blue-500"
              >
                <MessageCircle size={12} />{" "}
                {
                  comments.filter(
                    (c) => c.post_id === post.id && c.type === "post"
                  ).length
                }
              </button>
              <button className="flex items-center gap-1 text-stone-500 hover:text-red-500">
                <Flag size={12} />
              </button>
            </div>
            <button
              onClick={() => setSelectedPost(post)}
              className="text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Lihat Detail →
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Showcase;
