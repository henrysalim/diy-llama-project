import { Upload, X } from "lucide-react";
import CommunityModalLayout from "./Layout/CommunityModalLayout";

const CreateProduct = ({
  setShowCreateProduct,
  newProduct,
  setNewProduct,
  fileInputRef,
  productCategories,
  handleCreateProductWithImages,
  isUploading,
}) => (
  <CommunityModalLayout>
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-xl font-bold">🛒 Jual Produk</h3>
      <button onClick={() => setShowCreateProduct(false)}>
        <X size={24} />
      </button>
    </div>
    <div className="space-y-4">
      <input
        type="text"
        value={newProduct.title}
        onChange={(e) =>
          setNewProduct({ ...newProduct, title: e.target.value })
        }
        placeholder="Nama Produk"
        className="w-full p-3 border rounded-lg"
      />
      <textarea
        value={newProduct.description}
        onChange={(e) =>
          setNewProduct({ ...newProduct, description: e.target.value })
        }
        placeholder="Deskripsi produk (termasuk info kontak/pembelian jika tidak ada link)"
        rows="4"
        className="w-full p-3 border rounded-lg"
      />

      {/* --- BAGIAN UNGGAH GAMBAR --- */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Foto Produk (Maks. 3)
        </label>
        <div className="flex flex-wrap items-center gap-4">
          {/* Preview untuk gambar yang dipilih */}
          {newProduct.images.map((file, index) => (
            <div key={index} className="relative w-24 h-24">
              <img
                src={URL.createObjectURL(file)}
                alt={`preview ${index}`}
                className="w-full h-full object-cover rounded-lg border"
              />
              <button
                onClick={() => {
                  const updatedImages = newProduct.images.filter(
                    (_, i) => i !== index
                  );
                  setNewProduct({
                    ...newProduct,
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
          {newProduct.images.length < 3 && (
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
              setNewProduct((prev) => ({
                ...prev,
                images: [...prev.images, ...filesArray].slice(0, 3),
              }));
              // Reset value agar bisa memilih file yang sama lagi setelah dihapus
              e.target.value = null;
            }
          }}
        />
      </div>
      {/* --------------------------- */}

      <div className="grid grid-cols-3 gap-4">
        <select
          value={newProduct.category}
          onChange={(e) =>
            setNewProduct({ ...newProduct, category: e.target.value })
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
          value={newProduct.condition}
          onChange={(e) =>
            setNewProduct({ ...newProduct, condition: e.target.value })
          }
          className="p-3 border rounded-lg"
        >
          <option value="baru">Baru</option>
          <option value="bekas">Bekas</option>
        </select>
        <input
          type="number"
          value={newProduct.stock}
          onChange={(e) =>
            setNewProduct({ ...newProduct, stock: e.target.value })
          }
          placeholder="Stok"
          className="p-3 border rounded-lg"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <input
          type="number"
          value={newProduct.price}
          onChange={(e) =>
            setNewProduct({ ...newProduct, price: e.target.value })
          }
          placeholder="Harga (Rp)"
          className="p-3 border rounded-lg"
        />
        <input
          type="text"
          value={newProduct.shipping_cost}
          onChange={(e) =>
            setNewProduct({
              ...newProduct,
              shipping_cost: e.target.value,
            })
          }
          placeholder="Ongkir (Rp)"
          className="p-3 border rounded-lg"
        />
      </div>
      <input
        type="text"
        value={newProduct.location}
        onChange={(e) =>
          setNewProduct({ ...newProduct, location: e.target.value })
        }
        placeholder="Lokasi (Kota)"
        className="w-full p-3 border rounded-lg"
      />
      <input
        type="text"
        value={newProduct.purchase_link || ""}
        onChange={(e) =>
          setNewProduct({
            ...newProduct,
            purchase_link: e.target.value,
          })
        }
        placeholder="Link Pembelian (opsional, misal: link Shopee)"
        className="w-full p-3 border rounded-lg"
      />
      <button
        onClick={() => handleCreateProductWithImages(newProduct)}
        className="w-full px-4 py-3 bg-emerald-500 text-white rounded-lg font-bold hover:bg-emerald-600 transition-colors disabled:bg-gray-400"
        disabled={isUploading}
      >
        {isUploading ? "Mengunggah..." : "🚀 Jual Produk"}
      </button>
    </div>
  </CommunityModalLayout>
);

export default CreateProduct;
