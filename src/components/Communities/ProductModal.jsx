import { useState } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  MapPin,
  ShoppingCart,
} from "lucide-react";
import CommunityModalLayout from "./Modals/Layout/CommunityModalLayout";

export default function ProductModal({
  selectedProduct,
  setSelectedProduct,
  setEditingItem,
  handleDelete,
  getCurrentUser,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!selectedProduct) return null;

  const images = selectedProduct.images || [];

  const prevImage = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <CommunityModalLayout>
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <h1 className="text-2xl font-bold">{selectedProduct.title}</h1>
        <button onClick={() => setSelectedProduct(null)}>
          <X size={24} />
        </button>
      </div>

      {/* Image Carousel */}
      <div className="relative aspect-video bg-stone-100 rounded-lg mb-4 flex items-center justify-center">
        {images.length > 0 ? (
          <>
            <img
              src={images[currentIndex]}
              alt={`${selectedProduct.title} - ${currentIndex + 1}`}
              className="w-full h-full object-contain rounded-lg"
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
            {/* Thumbnail indicators */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-2.5 h-2.5 rounded-full ${
                    idx === currentIndex ? "bg-white" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          </>
        ) : (
          <span className="text-6xl">🛍️</span>
        )}
      </div>

      {/* Product Info */}
      <p className="text-stone-700 mb-4">{selectedProduct.description}</p>
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <span className="text-stone-500">Harga:</span>
          <div className="text-2xl font-bold text-emerald-600">
            Rp{Number(selectedProduct.price || 0).toLocaleString("id-ID")}
          </div>
        </div>
        <div>
          <span className="text-stone-500">Stok:</span>
          <div className="font-medium">{selectedProduct.stock} unit</div>
        </div>
        <div>
          <span className="text-stone-500">Kondisi:</span>
          <div className="font-medium capitalize">
            {selectedProduct.condition}
          </div>
        </div>
        <div>
          <span className="text-stone-500">Kategori:</span>
          <div className="font-medium capitalize">
            {selectedProduct.category}
          </div>
        </div>
      </div>

      {selectedProduct.shipping_cost && (
        <div className="text-sm text-stone-600 mb-4">
          Ongkos kirim: Rp
          {Number(selectedProduct.shipping_cost).toLocaleString("id-ID")}
        </div>
      )}

      {selectedProduct.location && (
        <div className="text-sm text-stone-600 mb-4 flex items-center gap-1">
          <MapPin size={14} /> {selectedProduct.location}
        </div>
      )}

      <div className="text-sm text-stone-500 mb-4">
        Dijual oleh: {selectedProduct.user_name} •{" "}
        {new Date(selectedProduct.created_at).toLocaleDateString()}
      </div>

      {/* Edit & Delete Buttons */}
      {selectedProduct.user_id === getCurrentUser().id && (
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => {
              setSelectedProduct(null);
              setEditingItem({ ...selectedProduct, type: "products" });
            }}
            className="flex-1 text-center bg-blue-100 text-blue-800 py-2 rounded-lg text-sm hover:bg-blue-200"
          >
            Edit Produk
          </button>
          <button
            onClick={() => handleDelete("products", selectedProduct.id)}
            className="flex-1 text-center bg-red-100 text-red-800 py-2 rounded-lg text-sm hover:bg-red-200"
          >
            Hapus Produk
          </button>
        </div>
      )}

      {/* Buy Button */}
      <button
        onClick={() => {
          if (selectedProduct.purchase_link) {
            window.open(selectedProduct.purchase_link, "_blank");
          } else {
            alert(
              "Silahkan baca deskripsi untuk info pembelian atau hubungi penjual."
            );
          }
        }}
        className="w-full bg-emerald-500 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-emerald-600 transition-colors"
      >
        <ShoppingCart size={16} /> Beli Sekarang
      </button>
    </CommunityModalLayout>
  );
}
