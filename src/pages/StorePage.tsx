import { useParams, useNavigate } from "react-router-dom";
import { stores } from "@/lib/data";
import { useCart } from "@/lib/cart-context";
import { ArrowRight, Star, Clock, Plus, Minus } from "lucide-react";
import { motion } from "framer-motion";

const StorePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { items, addItem, updateQuantity } = useCart();
  const store = stores.find((s) => s.id === id);

  if (!store) return <div className="p-8 text-center">المتجر غير موجود</div>;

  const getQuantity = (productId: string) => {
    const item = items.find((i) => i.product.id === productId);
    return item?.quantity || 0;
  };

  return (
    <div className="min-h-screen bg-background pb-20" dir="rtl">
      {/* Header Image */}
      <div className="relative h-56 overflow-hidden">
        <img src={store.image} alt={store.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-10 right-4 bg-card/90 backdrop-blur rounded-full p-2 shadow-card"
        >
          <ArrowRight className="h-5 w-5 text-foreground" />
        </button>
        <div className="absolute bottom-4 right-4 left-4">
          <h1 className="text-2xl font-bold text-card">{store.name}</h1>
          <div className="flex items-center gap-3 mt-1 text-card/90 text-sm">
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 text-warning fill-warning" />
              {store.rating} ({store.reviewCount}+)
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {store.deliveryTime} دقيقة
            </span>
          </div>
        </div>
      </div>

      {/* Products */}
      <section className="px-4 pt-6">
        <h2 className="text-lg font-semibold mb-4">القائمة</h2>
        <div className="space-y-3">
          {store.products.map((product) => {
            const qty = getQuantity(product.id);
            return (
              <motion.div
                key={product.id}
                layout
                className="bg-card rounded-2xl p-4 shadow-card flex gap-4 items-center"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{product.name}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">{product.description}</p>
                  <p className="text-primary font-bold mt-2 tabular-nums">{product.price} ج.م</p>
                </div>
                <div className="flex items-center gap-2">
                  {qty > 0 && (
                    <>
                      <button
                        onClick={() => updateQuantity(product.id, qty - 1)}
                        className="h-8 w-8 rounded-xl bg-muted flex items-center justify-center text-foreground hover:bg-accent transition-colors"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="font-semibold tabular-nums w-6 text-center">{qty}</span>
                    </>
                  )}
                  <button
                    onClick={() => addItem(product, store)}
                    className="h-8 w-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-all"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default StorePage;
