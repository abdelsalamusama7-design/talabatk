import { useCart } from "@/lib/cart-context";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const CartPage = () => {
  const { items, updateQuantity, removeItem, clearCart, total } = useCart();
  const navigate = useNavigate();

  const deliveryFee = items.length > 0 ? items[0].store.deliveryFee : 0;

  const handleOrder = () => {
    toast.success("تم تأكيد الطلب! الدفع عند الاستلام 🎉");
    clearCart();
    navigate("/orders");
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center pb-20 px-4" dir="rtl">
        <ShoppingBag className="h-20 w-20 text-muted-foreground/30 mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">السلة فارغة</h2>
        <p className="text-muted-foreground text-sm mb-6">أضف منتجات من المتاجر للبدء</p>
        <button
          onClick={() => navigate("/")}
          className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity"
        >
          تصفح المتاجر
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24" dir="rtl">
      <div className="pt-12 px-4">
        <h1 className="text-2xl font-bold mb-6">السلة</h1>

        <AnimatePresence>
          {items.map((item) => (
            <motion.div
              key={item.product.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="bg-card rounded-2xl p-4 shadow-card mb-3 flex items-center gap-4"
            >
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{item.product.name}</h3>
                <p className="text-xs text-muted-foreground">{item.store.name}</p>
                <p className="text-primary font-bold mt-1 tabular-nums">{item.product.price * item.quantity} ج.م</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                  className="h-8 w-8 rounded-xl bg-muted flex items-center justify-center"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="font-semibold tabular-nums w-6 text-center">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                  className="h-8 w-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <button
                  onClick={() => removeItem(item.product.id)}
                  className="h-8 w-8 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive mr-1"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Summary */}
        <div className="bg-card rounded-2xl p-4 shadow-card mt-6 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">المجموع الفرعي</span>
            <span className="tabular-nums font-semibold">{total} ج.م</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">رسوم التوصيل</span>
            <span className="tabular-nums font-semibold">{deliveryFee} ج.م</span>
          </div>
          <div className="border-t border-border pt-3 flex justify-between">
            <span className="font-bold">الإجمالي</span>
            <span className="font-bold text-primary tabular-nums">{total + deliveryFee} ج.م</span>
          </div>
        </div>

        <div className="bg-accent rounded-2xl p-4 mt-4 text-center">
          <p className="text-sm text-accent-foreground font-medium">💵 الدفع عند الاستلام</p>
        </div>
      </div>

      {/* Fixed CTA */}
      <div className="fixed bottom-16 left-0 right-0 p-4 bg-background/80 backdrop-blur">
        <button
          onClick={handleOrder}
          className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold text-lg hover:opacity-90 transition-opacity shadow-card"
        >
          تأكيد الطلب • {total + deliveryFee} ج.م
        </button>
      </div>
    </div>
  );
};

export default CartPage;
