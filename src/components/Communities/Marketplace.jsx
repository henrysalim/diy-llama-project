import { Eye } from "lucide-react";

const Marketplace = ({ filteredProducts, setSelectedProduct }) => {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
      {filteredProducts.map((product) => (
        <div
          key={product.id}
          className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="p-4">
            <div className="aspect-square bg-stone-100 rounded mb-2 flex items-center justify-center text-4xl">
              <img src={product.images?.[0] || "🛍️"} alt={product.title} />
            </div>
            <h3 className="font-semibold mb-2 text-sm line-clamp-2">
              {product.title}
            </h3>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="font-bold text-emerald-600">
                Rp{Number(product.price || 0).toLocaleString("id-ID")}
              </span>
              {product.shipping_cost && (
                <span className="text-xs text-stone-500">
                  +{product.shipping_cost} ongkir
                </span>
              )}
            </div>
            <div className="text-xs text-stone-500 mb-3">
              <div>Seller: {product.user_name}</div>
              <div>
                Stock: {product.stock} | {product.condition}
              </div>
              {product.location && <div>📍 {product.location}</div>}
            </div>
            <button
              onClick={() => setSelectedProduct(product)}
              className="w-full bg-emerald-500 text-white py-2 px-3 rounded-lg text-xs hover:bg-emerald-600 flex items-center justify-center gap-1"
            >
              <Eye size={12} /> Lihat Detail
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Marketplace;
