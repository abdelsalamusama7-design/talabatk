import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { stores, isWeightCategory, WeightOption, weightLabels } from "@/lib/data";
import { useCart } from "@/lib/cart-context";
import { ArrowRight, Star, Clock, Plus, Minus, MessageCircle, Scale } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReviewsList from "@/components/ReviewsList";
import ReviewForm from "@/components/ReviewForm";
import { Textarea } from "@/components/ui/textarea";

const WEIGHT_OPTIONS: WeightOption[] = ["0.25", "0.5", "1", "2", "3"];

const StorePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { items, addItem, updateQuantity } = useCart();
  const store = stores.find((s) => s.id === id);
  const [reviewRefresh, setReviewRefresh] = useState(0);
  const [selectedWeights, setSelectedWeights] = useState<Record<string, WeightOption>>({});
  const [itemNotes, setItemNotes] = useState<Record<string, string>>({});
  const [showNoteFor, setShowNoteFor] = useState<string | null>(null);

  if (!store) return <div className="p-8 text-center">المتجر غير موجود</div>;

  const isWeightStore = isWeightCategory(store.categoryId);

  const getQuantity = (productId: string, weight?: WeightOption) => {
    const item = items.find((i) => {
      if (weight) return i.product.id === productId && i.weight === weight;
      return i.product.id === productId && !i.weight;
    });
    return item?.quantity || 0;
  };

  const getWeight = (productId: string): WeightOption => {
    return selectedWeights[productId] || "1";
  };

  const getPrice = (basePrice: number, weight: WeightOption) => {
    return basePrice * parseFloat(weight);
  };

  return (
    <div className="min-h-screen bg-background pb-20" dir="rtl">
      {/* Header Image */}
      <div className="relative h-56 md:h-72 lg:h-80 overflow-hidden">
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
      <div className="max-w-4xl mx-auto">
        <section className="px-4 pt-6">
          <h2 className="text-lg font-semibold mb-4">القائمة</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {store.products.map((product) => {
              const weight = getWeight(product.id);
              const qty = isWeightStore
                ? getQuantity(product.id, weight)
                : getQuantity(product.id);
              const displayPrice = isWeightStore
                ? getPrice(product.price, weight)
                : product.price;

              return (
                <motion.div
                  key={product.id}
                  layout
                  className="bg-card rounded-2xl p-4 shadow-card"
                >
                  <div className="flex gap-3 items-center">
                    {product.image && (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-20 h-20 rounded-xl object-cover shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground">{product.name}</h3>
                      <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{product.description}</p>
                      <p className="text-primary font-bold mt-2 tabular-nums">
                        {displayPrice.toFixed(0)} ج.م
                        {isWeightStore && (
                          <span className="text-xs text-muted-foreground font-normal mr-1">
                            / {weightLabels[weight]}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {qty > 0 && (
                        <>
                          <button
                            onClick={() =>
                              isWeightStore
                                ? updateQuantity(product.id, qty - 1, weight)
                                : updateQuantity(product.id, qty - 1)
                            }
                            className="h-8 w-8 rounded-xl bg-muted flex items-center justify-center text-foreground hover:bg-accent transition-colors"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="font-semibold tabular-nums w-6 text-center">{qty}</span>
                        </>
                      )}
                      <button
                        onClick={() =>
                          isWeightStore
                            ? addItem(product, store, weight, itemNotes[product.id])
                            : addItem(product, store, undefined, itemNotes[product.id])
                        }
                        className="h-8 w-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-all"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Weight selector for vegetables/fruits */}
                  {isWeightStore && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Scale className="h-3.5 w-3.5 text-primary" />
                        <span className="text-xs font-semibold text-foreground">اختر الوزن:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {WEIGHT_OPTIONS.map((w) => (
                          <button
                            key={w}
                            onClick={() =>
                              setSelectedWeights((prev) => ({ ...prev, [product.id]: w }))
                            }
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                              weight === w
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "bg-muted text-muted-foreground hover:bg-accent"
                            }`}
                          >
                            {weightLabels[w]}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Item note toggle & input */}
                  <div className="mt-2">
                    <button
                      onClick={() =>
                        setShowNoteFor(showNoteFor === product.id ? null : product.id)
                      }
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      {itemNotes[product.id] ? "تعديل الملاحظة" : "أضف ملاحظة"}
                    </button>
                    <AnimatePresence>
                      {showNoteFor === product.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <Textarea
                            placeholder="مثلاً: عايز الطماطم ناشفة، الموز مستوي..."
                            value={itemNotes[product.id] || ""}
                            onChange={(e) =>
                              setItemNotes((prev) => ({ ...prev, [product.id]: e.target.value }))
                            }
                            className="mt-2 rounded-xl text-sm min-h-[60px] resize-none"
                            maxLength={200}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                    {itemNotes[product.id] && showNoteFor !== product.id && (
                      <p className="text-xs text-success mt-1 truncate">
                        📝 {itemNotes[product.id]}
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Reviews Section */}
        <section className="px-4 pt-6 space-y-4">
          <ReviewsList restaurantId={id!} refreshKey={reviewRefresh} />
          <ReviewForm restaurantId={id!} onSubmitted={() => setReviewRefresh((r) => r + 1)} />
        </section>
      </div>
    </div>
  );
};

export default StorePage;
