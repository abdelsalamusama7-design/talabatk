import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { CartItem, Product, Store } from "./data";

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, store: Store) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
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

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    saveCartToStorage(items);
  }, [items]);

  const addItem = useCallback((product: Product, store: Store) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, store, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.product.id !== productId));
    } else {
      setItems((prev) =>
        prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i))
      );
    }
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem(CART_STORAGE_KEY);
  }, []);

  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total, itemCount, pendingPromoCode, setPendingPromoCode }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};
