import { useState, useRef, useEffect } from "react";
import {
  Heart,
  Share2,
  Clock,
  DollarSign,
  Users,
  Trophy,
  Zap,
  Search,
  Plus,
  X,
  Send,
} from "lucide-react";
import Showcase from "../components/Communities/Showcase";
import Marketplace from "../components/Communities/Marketplace";
import Challenges from "../components/Communities/Challenges";
import Live from "../components/Communities/Live";
import CreatePost from "../components/Communities/Modals/CreatePost";
import CreateProduct from "../components/Communities/Modals/CreateProduct";
import { supabase } from "../auth/supabase";
import ProductModal from "../components/Communities/ProductModal";
import CreateWorkshop from "../components/Communities/Modals/CreateWorkshop";

const DIYCommunity = () => {
  const [activeTab, setActiveTab] = useState("showcase");

  // Modal states
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCreateProduct, setShowCreateProduct] = useState(false);
  const [showCreateWorkshop, setShowCreateWorkshop] = useState(false);
  const [showCreateChallenge, setShowCreateChallenge] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  // Form states
  const [newPost, setNewPost] = useState({
    title: "",
    description: "",
    images: [],
    category: "kerajinan",
    difficulty: "mudah",
    materials: [],
    time_spent: "",
    tutorial_steps: "",
  });
  const [newProduct, setNewProduct] = useState({
    title: "",
    description: "",
    price: "",
    images: [],
    category: "ready-made",
    condition: "baru",
    stock: "",
    shipping_cost: "",
    location: "",
    purchase_link: "",
    images: [],
  });
  const [newWorkshop, setNewWorkshop] = useState({
    title: "",
    description: "",
    scheduled_time: "",
    category: "kerajinan",
    max_participants: "",
    duration: "",
    materials_needed: "",
    price: "0",
  });
  const [newChallenge, setNewChallenge] = useState({
    title: "",
    description: "",
    prize: "",
    deadline: "",
    difficulty: "semua level",
    rules: "",
    criteria: "",
  });
  const [newComment, setNewComment] = useState("");
  const [editFormData, setEditFormData] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  // const fileInputRef = useRef(null);

  // Data states
  const [posts, setPosts] = useState([]);
  const [products, setProducts] = useState([]);
  const [workshops, setWorkshops] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [comments, setComments] = useState([]);
  const [likes, setLikes] = useState([]);
  const [participants, setParticipants] = useState([]);

  // UI states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showLiveStream, setShowLiveStream] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isLive, setIsLive] = useState(false);

  const fileInputRef = useRef(null);

  // Mock current user - In real app, get from auth
  const getCurrentUser = async () => {
    return await supabase.auth.getUser();
  };

  // Categories
  const categories = [
    { id: "all", name: "Semua", icon: "🏠" },
    { id: "kerajinan", name: "Kerajinan", icon: "✂️" },
    { id: "lampu-hias", name: "Lampu Hias", icon: "💡" },
    { id: "garden", name: "Garden", icon: "🌱" },
    { id: "upcycle", name: "Upcycle", icon: "♻️" },
    { id: "furniture", name: "Furniture", icon: "🪑" },
  ];

  const productCategories = [
    { id: "all", name: "Semua", icon: "🏠" },
    { id: "ready-made", name: "Ready Made", icon: "✨" },
    { id: "diy-kit", name: "DIY Kit", icon: "🔧" },
    { id: "material", name: "Bahan", icon: "🧵" },
  ];

  const difficultyLevels = [
    { id: "mudah", name: "Mudah", color: "green" },
    { id: "sedang", name: "Sedang", color: "yellow" },
    { id: "sulit", name: "Sulit", color: "red" },
    { id: "expert", name: "Expert", color: "purple" },
  ];

  // --- Data Loading & Management ---
  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (editingItem) {
      setEditFormData(editingItem);
    } else {
      setEditFormData({});
    }
  }, [editingItem]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [
        postsRes,
        productsRes,
        workshopsRes,
        challengesRes,
        commentsRes,
        likesRes,
        participantsRes,
      ] = await Promise.all([
        supabase.from("posts").select(),
        supabase.from("products").select(),
        supabase.from("workshops").select(),
        supabase.from("challenges").select(),
        supabase.from("comments").select(),
        supabase.from("likes").select(),
        supabase.from("participants").select(),
      ]);

      setPosts(postsRes.data || []);
      setProducts(productsRes.data || []);
      setWorkshops(workshopsRes.data || []);
      setChallenges(challengesRes.data || []);
      setComments(commentsRes.data || []);
      setLikes(likesRes.data || []);
      setParticipants(participantsRes.data || []);
    } catch (err) {
      setError("Failed to load data: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- CRUD Operations ---
  const handleCreate = async (type, data, resetter, close) => {
    setLoading(true);

    const {
      data: { user },
    } = await getCurrentUser();

    try {
      const payload = {
        ...data,
        user_id: user.id,
        user_name: user.user_metadata?.full_name,
        user_avatar: user.user_metadata?.avatar,
        created_at: new Date().toISOString(),
      };

      if (type === "posts") {
        const imageUrls = await Promise.all(
          data.images.map(async (file) => {
            const filePath = `${user.id}/${Date.now()}-${file.name}`;

            // Upload file
            const { error: uploadError } = await supabase.storage
              .from("showcase_images")
              .upload(filePath, file);

            if (uploadError) {
              console.error(error);
              throw uploadError;
            }

            // Get signed URL
            const { data, error } = await supabase.storage
              .from("showcase_images") // must match the bucket name!
              .createSignedUrl(filePath, 60 * 60); // 1 hour

            if (error) {
              console.error(error);
              return null;
            }
            console.log(data);
            return data.signedUrl;
          })
        );
        payload.images
          ? (payload.images = imageUrls.filter((url) => url !== null))
          : (payload.images = []);

        payload.materials = Array.isArray(data.materials)
          ? data.materials
          : data.materials.split(",").map((m) => m.trim());
      }
      if (type === "workshops") {
        payload.materials_needed = Array.isArray(data.materials_needed)
          ? data.materials_needed
          : data.materials_needed.split(",").map((m) => m.trim());
      }

      const { error } = await supabase.from(type).insert(payload);
      if (error) throw new Error(error.message);

      resetter();
      close();
      await loadData();
    } catch (err) {
      setError(`Failed to create ${type.slice(0, -1)}: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const { type, ...payload } = editFormData;
      payload.updated_at = new Date().toISOString();

      const result = await supabase
        .from(type)
        .update(payload)
        .eq("id", payload.id);
      if (result.error) throw new Error(result.error.message);

      setEditingItem(null);
      await loadData();
    } catch (err) {
      setError(`Failed to update item: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (type, id) => {
    if (
      !window.confirm(
        `Are you sure you want to delete this ${type.slice(0, -1)}?`
      )
    )
      return;
    setLoading(true);
    try {
      const result = await supabase.from(type).delete().eq("id", id);
      if (result.error) throw new Error(result.error.message);

      // Close any open modals for the deleted item
      if (selectedPost && type === "posts" && selectedPost.id === id)
        setSelectedPost(null);
      if (selectedProduct && type === "products" && selectedProduct.id === id)
        setSelectedProduct(null);
      if (
        selectedWorkshop &&
        type === "workshops" &&
        selectedWorkshop.id === id
      )
        setSelectedWorkshop(null);

      await loadData();
    } catch (err) {
      setError(`Failed to delete ${type.slice(0, -1)}: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // --- User Interactions ---
  const handleLikePost = async (postId) => {
    const {
      data: { user },
    } = await getCurrentUser();

    const existingLike = likes.find(
      (like) => like.user_id === user.id && like.post_id === postId
    );
    try {
      if (existingLike) {
        await supabase.from("likes").delete().eq("id", existingLike.id);
      } else {
        const { error } = await supabase.from("likes").insert({
          user_id: user.id,
          post_id: postId,
          type: "post",
          created_at: `${new Date().toISOString()}`,
        });
        console.log(error);
      }

      // Update post likes count
      const postLikes = likes.filter((l) => l.post_id === postId);
      const newCount = existingLike
        ? postLikes.length - 1
        : postLikes.length + 1;
      await supabase
        .from("posts")
        .update({ likes_count: newCount })
        .eq("id", postId);

      await loadData();
    } catch (err) {
      setError("Failed to toggle like: " + err.message);
    }
  };

  const handleCreateProductWithImages = async () => {
    if (!newProduct.title || !newProduct.price) {
      alert("Nama produk dan harga wajib diisi!");
      return;
    }
    if (newProduct.images.length === 0) {
      alert("Mohon unggah minimal satu foto produk.");
      return;
    }

    setIsUploading(true);

    try {
      const {
        data: { user },
      } = await getCurrentUser();

      const imageUrls = await Promise.all(
        newProduct.images.map(async (file) => {
          const filePath = `${user.id}/${Date.now()}-${file.name}`;

          // Upload file
          const { error: uploadError } = await supabase.storage
            .from("product_images")
            .upload(filePath, file);

          if (uploadError) {
            throw uploadError;
          }

          // Get signed URL
          const { data, error } = await supabase.storage
            .from("product_images") // must match the bucket name!
            .createSignedUrl(filePath, 60 * 60); // 1 hour

          if (error) {
            console.error(error);
            return null;
          }

          return data.signedUrl;
        })
      );

      // Filter out failed uploads
      const validImageUrls = imageUrls.filter((url) => url !== null);

      const productData = {
        ...newProduct,
        images: validImageUrls,
        user_id: user.id,
        user_name: user.user_metadata?.name,
        user_avatar: user.avatar,
      };

      const { error: insertError } = await supabase
        .from("products")
        .insert(productData);

      if (insertError) {
        console.error(insertError);
      }

      alert("Produk berhasil ditambahkan! ✅");
      setShowCreateProduct(false);
      setNewProduct({
        title: "",
        description: "",
        price: "",
        images: [],
        category: "ready-made",
        condition: "baru",
        stock: "",
        purchase_link: "",
      });
      await loadData();
    } catch (error) {
      console.error("Error creating product:", error);
      alert(`Gagal menambahkan produk: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddComment = async (postId, type = "post") => {
    const {
      data: { user },
    } = await getCurrentUser();

    if (!newComment.trim()) return;
    try {
      const commentData = {
        user_id: user.id,
        user_name: user.user_metadata?.full_name,
        user_avatar: user.avatar,
        post_id: postId,
        content: newComment,
        type: type,
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("comments").insert(commentData);

      if (error) console.error(error);

      // Update comments count
      const table = type === "post" ? "posts" : "workshops";
      const currentComments = comments.filter(
        (c) => c.post_id === postId && c.type === type
      );
      await supabase
        .from(table)
        .update({ comments_count: currentComments.length + 1 })
        .eq("id", postId);

      setNewComment("");
      await loadData();
    } catch (err) {
      setError("Failed to add comment: " + err.message);
    }
  };

  const handleJoin = async (type, itemId) => {
    const {
      data: { user },
    } = await getCurrentUser();

    try {
      const existingParticipant = participants.find(
        (p) => p.user_id === user.id && p.item_id === itemId && p.type === type
      );

      if (existingParticipant) {
        alert(`You are already joined this ${type}!`);
        return;
      }

      const participantData = {
        user_id: user.id,
        user_name: user.user_metadata?.name,
        user_avatar: user.avatar,
        item_id: itemId,
        type: type,
        created_at: new Date().toISOString(),
      };

      await supabase.from("participants").insert(participantData);

      // Update participant count
      const table = type === "challenge" ? "challenges" : "workshops";
      const collection = type === "challenge" ? challenges : workshops;
      const item = collection.find((c) => c.id === itemId);

      await loadData();
      alert(`Successfully joined the ${type}!`);
    } catch (err) {
      setError(`Failed to join ${type}: ${err.message}`);
    }
  };

  // --- Filtering and Helper Functions ---
  const filteredPosts = posts.filter(
    (post) =>
      (post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.description?.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (filterCategory === "all" || post.category === filterCategory)
  );

  const filteredProducts = products.filter(
    (product) =>
      (product.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase())) &&
      (filterCategory === "all" || product.category === filterCategory)
  );

  const filteredWorkshops = workshops.filter(
    (workshop) =>
      (workshop.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        workshop.description
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase())) &&
      (filterCategory === "all" || workshop.category === filterCategory)
  );

  const filteredChallenges = challenges.filter(
    (challenge) =>
      (challenge.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        challenge.description
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase())) &&
      (filterCategory === "all" || challenge.difficulty === filterCategory)
  );

  const getPostComments = (postId, type = "post") =>
    comments.filter(
      (comment) => comment.post_id === postId && comment.type === type
    );

  const isPostLiked = async (postId) => {
    const {
      data: { user },
    } = await getCurrentUser();

    return likes.some(
      (like) => like.user_id === user.id && like.post_id === postId
    );
  };

  const isUserParticipating = async (itemId, type) => {
    const {
      data: { user },
    } = await getCurrentUser();

    participants.some(
      (p) => p.user_id === user.id && p.item_id === itemId && p.type === type
    );
  };

  const resetForms = () => {
    setNewPost({
      title: "",
      description: "",
      images: [],
      category: "kerajinan",
      difficulty: "mudah",
      materials: "",
      time_spent: "",
      tutorial_steps: "",
    });
    setNewProduct({
      title: "",
      description: "",
      price: "",
      images: [],
      category: "ready-made",
      condition: "baru",
      stock: "",
      shipping_cost: "",
      location: "",
    });
    setNewWorkshop({
      title: "",
      description: "",
      scheduled_time: "",
      category: "kerajinan",
      max_participants: "",
      duration: "",
      materials_needed: "",
      price: "0",
    });
    setNewChallenge({
      title: "",
      description: "",
      prize: "",
      deadline: "",
      difficulty: "semua level",
      rules: "",
      criteria: "",
    });
  };

  if (loading && posts.length === 0) {
    return (
      <div className="flex justify-center items-center w-md bg-stone-50 text-gray-900 p-10">
        <div className="text-xl">Loading creative works...</div>
      </div>
    );
  }

  return (
    <div className="h-full bg-stone-50 text-stone-800">
      <header className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-4 shadow-lg sticky top-0 z-40">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-extrabold">🌟 FeiCraft Community</h1>
              <p className="text-sm opacity-90">
                Showcase, Jual, Beli & Belajar DIY bersama!
              </p>
            </div>
            <div className="flex items-center gap-4"></div>
          </div>
          <div className="flex gap-6 border-b border-white/20">
            {[
              { id: "showcase", label: "🎨 Showcase", desc: "Hasil karya DIY" },
              {
                id: "marketplace",
                label: "🛒 Marketplace",
                desc: "Jual beli produk",
              },
              {
                id: "live",
                label: "📺 Live Workshop",
                desc: "Belajar real-time",
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-4 px-2 text-left transition-all ${
                  activeTab === tab.id
                    ? "border-b-2 border-white text-white"
                    : "text-white/70 hover:text-white/90"
                }`}
              >
                <div className="font-medium">{tab.label}</div>
                <div className="text-xs opacity-80">{tab.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </header>

      {error && (
        <div className="max-w-6xl mx-auto p-4">
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex justify-between">
            <span>{error}</span>
            <button onClick={() => setError("")}>
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-xl p-4 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400"
              size={20}
            />
            <input
              type="text"
              placeholder={`Cari ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="flex items-center gap-4">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
            >
              {(activeTab === "marketplace"
                ? productCategories
                : activeTab === "challenges"
                ? difficultyLevels
                    .map((d) => ({ id: d.id, name: d.name, icon: "🏆" }))
                    .concat([{ id: "all", name: "Semua Level", icon: "🏆" }])
                : categories
              ).map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
            {activeTab === "showcase" && (
              <button
                onClick={() => setShowCreatePost(true)}
                className="bg-emerald-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-emerald-600"
              >
                <Plus size={16} /> Posting Karya
              </button>
            )}
            {activeTab === "marketplace" && (
              <button
                onClick={() => setShowCreateProduct(true)}
                className="bg-emerald-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-emerald-600"
              >
                <Plus size={16} /> Jual Produk
              </button>
            )}
            {activeTab === "live" && (
              <button
                onClick={() => setShowCreateWorkshop(true)}
                className="bg-emerald-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-emerald-600"
              >
                <Plus size={16} /> Buat Workshop
              </button>
            )}
            {activeTab === "challenges" && (
              <button
                onClick={() => setShowCreateChallenge(true)}
                className="bg-emerald-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-emerald-600"
              >
                <Plus size={16} /> Buat Challenge
              </button>
            )}
          </div>
        </div>

        {/* --- KONTEN UTAMA BERDASARKAN TAB --- */}

        {activeTab === "showcase" && (
          <Showcase
            filteredPosts={filteredPosts}
            currentUser={getCurrentUser}
            likes={likes}
            comments={comments}
            setSelectedPost={setSelectedPost}
            setEditingItem={setEditingItem}
            handleLikePost={handleLikePost}
            handleDelete={handleDelete}
            isPostLiked={isPostLiked}
          />
        )}

        {activeTab === "marketplace" && (
          <Marketplace
            filteredProducts={filteredProducts}
            setSelectedProduct={setSelectedProduct}
          />
        )}

        {activeTab === "challenges" && (
          <Challenges
            filteredChallenges={filteredChallenges}
            setEditingItem={setEditingItem}
            currentUser={getCurrentUser}
            handleJoin={handleJoin}
            handleDelete={handleDelete}
            isUserParticipating={isUserParticipating}
          />
        )}

        {activeTab === "live" && (
          <Live
            filteredWorkshops={filteredWorkshops}
            currentUser={getCurrentUser}
            setEditingItem={setEditingItem}
            handleDelete={handleDelete}
            setSelectedWorkshop={setSelectedWorkshop}
            isUserParticipating={isUserParticipating}
          />
        )}
      </main>

      {/* --- MODALS --- */}

      {/* Create Post Modal */}
      {showCreatePost && (
        <CreatePost
          resetForms={resetForms}
          difficultyLevels={difficultyLevels}
          loading={loading}
          fileInputRef={fileInputRef}
          setShowCreatePost={setShowCreatePost}
          newPost={newPost}
          setNewPost={setNewPost}
          categories={categories}
          handleCreate={handleCreate}
        />
      )}

      {/* Create Product Modal */}
      {showCreateProduct && (
        <CreateProduct
          setShowCreateProduct={setShowCreateProduct}
          newProduct={newProduct}
          setNewProduct={setNewProduct}
          fileInputRef={fileInputRef}
          productCategories={productCategories}
          handleCreateProductWithImages={handleCreateProductWithImages}
          isUploading={isUploading}
        />
      )}

      {/* Create Workshop Modal */}
      {showCreateWorkshop && (
        <CreateWorkshop
          setShowCreateWorkshop={setShowCreateWorkshop}
          newWorkshop={newWorkshop}
          setNewWorkshop={setNewWorkshop}
          categories={categories}
          handleCreate={handleCreate}
          loading={loading}
          resetForms={resetForms}
        />
      )}

      {/* Create Challenge Modal */}
      {showCreateChallenge && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">🏆 Buat Challenge</h3>
              <button onClick={() => setShowCreateChallenge(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                value={newChallenge.title}
                onChange={(e) =>
                  setNewChallenge({ ...newChallenge, title: e.target.value })
                }
                placeholder="Judul Challenge"
                className="w-full p-3 border rounded-lg"
              />
              <textarea
                value={newChallenge.description}
                onChange={(e) =>
                  setNewChallenge({
                    ...newChallenge,
                    description: e.target.value,
                  })
                }
                placeholder="Deskripsi challenge..."
                rows="4"
                className="w-full p-3 border rounded-lg"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  value={newChallenge.prize}
                  onChange={(e) =>
                    setNewChallenge({ ...newChallenge, prize: e.target.value })
                  }
                  placeholder="Hadiah"
                  className="p-3 border rounded-lg"
                />
                <input
                  type="date"
                  value={newChallenge.deadline}
                  onChange={(e) =>
                    setNewChallenge({
                      ...newChallenge,
                      deadline: e.target.value,
                    })
                  }
                  className="p-3 border rounded-lg"
                />
              </div>
              <select
                value={newChallenge.difficulty}
                onChange={(e) =>
                  setNewChallenge({
                    ...newChallenge,
                    difficulty: e.target.value,
                  })
                }
                className="w-full p-3 border rounded-lg"
              >
                <option value="semua level">Semua Level</option>
                {difficultyLevels.map((level) => (
                  <option key={level.id} value={level.id}>
                    {level.name}
                  </option>
                ))}
              </select>
              <textarea
                value={newChallenge.rules}
                onChange={(e) =>
                  setNewChallenge({ ...newChallenge, rules: e.target.value })
                }
                placeholder="Aturan challenge..."
                rows="3"
                className="w-full p-3 border rounded-lg"
              />
              <textarea
                value={newChallenge.criteria}
                onChange={(e) =>
                  setNewChallenge({ ...newChallenge, criteria: e.target.value })
                }
                placeholder="Kriteria penilaian..."
                rows="3"
                className="w-full p-3 border rounded-lg"
              />
              <button
                onClick={() =>
                  handleCreate("challenges", newChallenge, resetForms, () =>
                    setShowCreateChallenge(false)
                  )
                }
                className="w-full px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                disabled={loading}
              >
                {loading ? "Membuat..." : "🚀 Buat Challenge"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post Detail Modal */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-2xl font-bold mb-1">
                  {selectedPost.title}
                </h1>
                <div className="flex items-center gap-3 text-sm text-stone-500">
                  <span>Oleh {selectedPost.user_name}</span>
                  <span>•</span>
                  <span>
                    {new Date(selectedPost.created_at).toLocaleDateString()}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      selectedPost.difficulty === "mudah"
                        ? "bg-green-100 text-green-800"
                        : selectedPost.difficulty === "sedang"
                        ? "bg-yellow-100 text-yellow-800"
                        : selectedPost.difficulty === "sulit"
                        ? "bg-red-100 text-red-800"
                        : "bg-purple-100 text-purple-800"
                    }`}
                  >
                    {selectedPost.difficulty}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedPost(null)}
                className="text-stone-500 hover:text-stone-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-stone-700 mb-4">
                  {selectedPost.description}
                </p>

                {selectedPost.materials && (
                  <div className="mb-4">
                    <h3 className="font-bold mb-2">Bahan-bahan:</h3>
                    <ul className="list-disc list-inside text-sm text-stone-600 space-y-1">
                      {(Array.isArray(selectedPost.materials)
                        ? selectedPost.materials
                        : selectedPost.materials.split(",")
                      ).map((material, index) => (
                        <li key={index}>{material.trim()}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedPost.time_spent && (
                  <div className="mb-4">
                    <h3 className="font-bold mb-2">⏱️ Waktu:</h3>
                    <p className="text-sm text-stone-600">
                      {selectedPost.time_spent}
                    </p>
                  </div>
                )}

                {selectedPost.tutorial_steps && (
                  <div className="mb-4">
                    <h3 className="font-bold mb-2">📋 Langkah-langkah:</h3>
                    <p className="text-sm text-stone-600 whitespace-pre-line">
                      {selectedPost.tutorial_steps}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center gap-4 mb-4">
                  <button
                    onClick={() => handleLikePost(selectedPost.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      isPostLiked(selectedPost.id)
                        ? "bg-red-100 text-red-600"
                        : "bg-stone-100 text-stone-600 hover:bg-red-50"
                    }`}
                  >
                    <Heart
                      size={16}
                      fill={
                        isPostLiked(selectedPost.id) ? "currentColor" : "none"
                      }
                    />
                    {likes.filter((l) => l.post_id === selectedPost.id).length}{" "}
                    Likes
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-stone-100 text-stone-600 rounded-lg hover:bg-stone-200">
                    <Share2 size={16} /> Share
                  </button>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-bold mb-4">
                    Komentar ({getPostComments(selectedPost.id, "post").length})
                  </h3>
                  <div className="space-y-3 max-h-60 overflow-y-auto mb-4 pr-2">
                    {getPostComments(selectedPost.id, "post").map((comment) => (
                      <div
                        key={comment.id}
                        className="flex items-start gap-3 text-sm bg-gray-50 p-3 rounded-lg"
                      >
                        <span className="text-lg">{comment.user_avatar}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">
                              {comment.user_name}
                            </span>
                            <span className="text-xs text-stone-400">
                              {new Date(
                                comment.created_at
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-stone-700">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Tulis komentar..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" &&
                        handleAddComment(selectedPost.id, "post")
                      }
                      className="flex-1 p-3 border rounded-lg"
                    />
                    <button
                      onClick={() => handleAddComment(selectedPost.id, "post")}
                      className="bg-emerald-500 text-white p-3 rounded-lg hover:bg-emerald-600"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductModal
          selectedProduct={selectedProduct}
          setSelectedProduct={setSelectedProduct}
          setEditingItem={setEditingItem}
          handleDelete={handleDelete}
          getCurrentUser={getCurrentUser}
        />
      )}

      {/* Workshop Detail Modal */}
      {selectedWorkshop && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-2xl font-bold mb-1">
                  {selectedWorkshop.title}
                </h1>
                <div className="flex items-center gap-3 text-sm text-stone-500">
                  <span>Instruktur: {selectedWorkshop.user_name}</span>
                  <span>•</span>
                  <span>
                    {new Date(
                      selectedWorkshop.scheduled_time
                    ).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedWorkshop(null)}>
                <X size={24} />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-stone-700 mb-4">
                  {selectedWorkshop.description}
                </p>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-stone-500" />
                    <span>
                      Tanggal:{" "}
                      {new Date(
                        selectedWorkshop.scheduled_time
                      ).toLocaleDateString("id-ID", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-stone-500" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap size={16} className="text-stone-500" />
                    <span>Durasi: {selectedWorkshop.duration || "1 jam"}</span>
                  </div>
                  {selectedWorkshop.price && selectedWorkshop.price !== "0" && (
                    <div className="flex items-center gap-2">
                      <DollarSign size={16} className="text-stone-500" />
                      <span>
                        Biaya: Rp
                        {Number(selectedWorkshop.price).toLocaleString("id-ID")}
                      </span>
                    </div>
                  )}
                </div>

                {selectedWorkshop.materials_needed && (
                  <div className="mt-4">
                    <h3 className="font-bold mb-2">Bahan yang diperlukan:</h3>
                    <ul className="list-disc list-inside text-sm text-stone-600 space-y-1">
                      {(Array.isArray(selectedWorkshop.materials_needed)
                        ? selectedWorkshop.materials_needed
                        : selectedWorkshop.materials_needed.split(",")
                      ).map((material, index) => (
                        <li key={index}>{material.trim()}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-6">
                  <button
                    onClick={async () => {
                      await handleJoin("workshop", selectedWorkshop.id);
                      if (selectedWorkshop.workshop_link) {
                        alert("Link workshop akan terbuka di tab baru.");
                        window.open(selectedWorkshop.workshop_link, "_blank");
                      } else {
                        alert("Link akan diberikan oleh penyelenggara.");
                      }
                    }}
                    disabled={isUserParticipating(
                      selectedWorkshop.id,
                      "workshop"
                    )}
                    className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
                      isUserParticipating(selectedWorkshop.id, "workshop")
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-red-500 text-white hover:bg-red-600"
                    }`}
                  >
                    <Trophy size={16} />
                    {isUserParticipating(selectedWorkshop.id, "workshop")
                      ? "✅ Sudah Terdaftar"
                      : "Daftar Sekarang"}
                  </button>
                </div>
              </div>

              <div>
                <div className="border-t pt-4 md:border-t-0 md:pt-0">
                  <h3 className="font-bold mb-4">
                    Diskusi Workshop (
                    {getPostComments(selectedWorkshop.id, "workshop").length})
                  </h3>
                  <div className="space-y-3 max-h-60 overflow-y-auto mb-4 pr-2">
                    {getPostComments(selectedWorkshop.id, "workshop").map(
                      (comment) => (
                        <div
                          key={comment.id}
                          className="flex items-start gap-3 text-sm bg-gray-50 p-3 rounded-lg"
                        >
                          <span className="text-lg">{comment.user_avatar}</span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold">
                                {comment.user_name}
                              </span>
                              <span className="text-xs text-stone-400">
                                {new Date(
                                  comment.created_at
                                ).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-stone-700">{comment.content}</p>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Tanya seputar workshop..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" &&
                        handleAddComment(selectedWorkshop.id, "workshop")
                      }
                      className="flex-1 p-3 border rounded-lg"
                    />
                    <button
                      onClick={() =>
                        handleAddComment(selectedWorkshop.id, "workshop")
                      }
                      className="bg-emerald-500 text-white p-3 rounded-lg hover:bg-emerald-600"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Universal Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                Edit {editingItem.type.slice(0, -1)}
              </h3>
              <button onClick={() => setEditingItem(null)}>
                <X />
              </button>
            </div>

            {editingItem.type === "posts" && (
              <div className="space-y-4">
                <input
                  type="text"
                  value={editFormData.title || ""}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, title: e.target.value })
                  }
                  placeholder="Judul"
                  className="w-full p-3 border rounded-lg"
                />
                <textarea
                  value={editFormData.description || ""}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      description: e.target.value,
                    })
                  }
                  placeholder="Deskripsi"
                  className="w-full p-3 border rounded-lg"
                  rows="4"
                />
                <div className="grid grid-cols-2 gap-4">
                  <select
                    value={editFormData.category || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        category: e.target.value,
                      })
                    }
                    className="p-3 border rounded-lg"
                  >
                    {categories.slice(1).map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={editFormData.difficulty || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        difficulty: e.target.value,
                      })
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
                  value={editFormData.materials || ""}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      materials: e.target.value,
                    })
                  }
                  placeholder="Bahan-bahan"
                  className="w-full p-3 border rounded-lg"
                />
                <input
                  type="text"
                  value={editFormData.time_spent || ""}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      time_spent: e.target.value,
                    })
                  }
                  placeholder="Waktu yang dibutuhkan"
                  className="w-full p-3 border rounded-lg"
                />
                <textarea
                  value={editFormData.tutorial_steps || ""}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      tutorial_steps: e.target.value,
                    })
                  }
                  placeholder="Langkah tutorial"
                  className="w-full p-3 border rounded-lg"
                  rows="3"
                />
              </div>
            )}

            {editingItem.type === "products" && (
              <div className="space-y-4">
                <input
                  type="text"
                  value={editFormData.title || ""}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, title: e.target.value })
                  }
                  placeholder="Nama Produk"
                  className="w-full p-3 border rounded-lg"
                />
                <textarea
                  value={editFormData.description || ""}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      description: e.target.value,
                    })
                  }
                  placeholder="Deskripsi"
                  className="w-full p-3 border rounded-lg"
                  rows="3"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    value={editFormData.price || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        price: e.target.value,
                      })
                    }
                    placeholder="Harga (Rp)"
                    className="p-3 border rounded-lg"
                  />
                  <input
                    type="number"
                    value={editFormData.stock || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        stock: e.target.value,
                      })
                    }
                    placeholder="Stok"
                    className="p-3 border rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <select
                    value={editFormData.category || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        category: e.target.value,
                      })
                    }
                    className="p-3 border rounded-lg"
                  >
                    {productCategories.slice(1).map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={editFormData.condition || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        condition: e.target.value,
                      })
                    }
                    className="p-3 border rounded-lg"
                  >
                    <option value="baru">Baru</option>
                    <option value="bekas">Bekas</option>
                  </select>
                </div>
                <input
                  type="text"
                  value={editFormData.location || ""}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      location: e.target.value,
                    })
                  }
                  placeholder="Lokasi"
                  className="w-full p-3 border rounded-lg"
                />
              </div>
            )}

            {editingItem.type === "workshops" && (
              <div className="space-y-4">
                <input
                  type="text"
                  value={editFormData.title || ""}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, title: e.target.value })
                  }
                  placeholder="Judul Workshop"
                  className="w-full p-3 border rounded-lg"
                />
                <textarea
                  value={editFormData.description || ""}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      description: e.target.value,
                    })
                  }
                  placeholder="Deskripsi"
                  className="w-full p-3 border rounded-lg"
                  rows="3"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="datetime-local"
                    value={editFormData.scheduled_time || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        scheduled_time: e.target.value,
                      })
                    }
                    className="p-3 border rounded-lg"
                  />
                  <input
                    type="number"
                    value={editFormData.max_participants || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        max_participants: e.target.value,
                      })
                    }
                    placeholder="Max Peserta"
                    className="p-3 border rounded-lg"
                  />
                </div>
                <input
                  type="text"
                  value={editFormData.materials_needed || ""}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      materials_needed: e.target.value,
                    })
                  }
                  placeholder="Bahan yang diperlukan"
                  className="w-full p-3 border rounded-lg"
                />
              </div>
            )}

            {editingItem.type === "challenges" && (
              <div className="space-y-4">
                <input
                  type="text"
                  value={editFormData.title || ""}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, title: e.target.value })
                  }
                  placeholder="Judul Challenge"
                  className="w-full p-3 border rounded-lg"
                />
                <textarea
                  value={editFormData.description || ""}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      description: e.target.value,
                    })
                  }
                  placeholder="Deskripsi"
                  className="w-full p-3 border rounded-lg"
                  rows="3"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={editFormData.prize || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        prize: e.target.value,
                      })
                    }
                    placeholder="Hadiah"
                    className="p-3 border rounded-lg"
                  />
                  <input
                    type="date"
                    value={editFormData.deadline || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        deadline: e.target.value,
                      })
                    }
                    className="p-3 border rounded-lg"
                  />
                </div>
                <textarea
                  value={editFormData.rules || ""}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, rules: e.target.value })
                  }
                  placeholder="Aturan"
                  className="w-full p-3 border rounded-lg"
                  rows="2"
                />
              </div>
            )}

            <button
              onClick={handleUpdate}
              className="w-full bg-blue-500 text-white py-3 rounded-lg mt-6 hover:bg-blue-600"
              disabled={loading}
            >
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DIYCommunity;
