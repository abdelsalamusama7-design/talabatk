import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { CartItem, Product, Store, WeightOption } from "./data";

// Composite key for cart items: productId + weight (if applicable)
const getCartKey = (productId: string, weight?: WeightOption) =>
  weight ? `${productId}__${weight}` : productId;

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, store: Store, weight?: WeightOption, itemNote?: string) => void;
  removeItem: (productId: string, weight?: WeightOption) => void;
  updateQuantity: (productId: string, quantity: number, weight?: WeightOption) => void;
  updateItemNote: (productId: string, note: string, weight?: WeightOption) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  pendingPromoCode: string | null;
  setPendingPromoCode: (code: string | null) => void;
}

const CART_STORAGE_KEY = "talabatk_cart";

const CartContext = createContext<CartContextType | undefined>(undefined);

const loadCartFromStorage = (): CartItem[] => {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch { /* ignore */ }
  return [];
};

const saveCartToStorage = (items: CartItem[]) => {
  try {
    if (items.length === 0) {
      localStorage.removeItem(CART_STORAGE_KEY);
    } else {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }
  } catch { /* ignore */ }
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => loadCartFromStorage());
  const [pendingPromoCode, setPendingPromoCode] = useState<string | null>(null);

  useEffect(() => {
    saveCartToStorage(items);
  }, [items]);

  const addItem = useCallback((product: Product, store: Store, weight?: WeightOption, itemNote?: string) => {
    setItems((prev) => {
      const key = getCartKey(product.id, weight);
      const existing = prev.find((i) => getCartKey(i.product.id, i.weight) === key);
      if (existing) {
        return prev.map((i) =>
          getCartKey(i.product.id, i.weight) === key
            ? { ...i, quantity: i.quantity + 1, itemNote: itemNote || i.itemNote }
            : i
        );
      }
      return [...prev, { product, store, quantity: 1, weight, itemNote }];
    });
  }, []);

  const removeItem = useCallback((productId: string, weight?: WeightOption) => {
    const key = getCartKey(productId, weight);
    setItems((prev) => prev.filter((i) => getCartKey(i.product.id, i.weight) !== key));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number, weight?: WeightOption) => {
    const key = getCartKey(productId, weight);
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => getCartKey(i.product.id, i.weight) !== key));
    } else {
      setItems((prev) =>
        prev.map((i) => (getCartKey(i.product.id, i.weight) === key ? { ...i, quantity } : i))
      );
    }
  }, []);

  const updateItemNote = useCallback((productId: string, note: string, weight?: WeightOption) => {
    const key = getCartKey(productId, weight);
    setItems((prev) =>
      prev.map((i) => (getCartKey(i.product.id, i.weight) === key ? { ...i, itemNote: note } : i))
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem(CART_STORAGE_KEY);
  }, []);

  const total = items.reduce((sum, i) => {
    const priceMultiplier = i.weight ? parseFloat(i.weight) : 1;
    return sum + i.product.price * priceMultiplier * i.quantity;
  }, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, updateItemNote, clearCart, total, itemCount, pendingPromoCode, setPendingPromoCode }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};
