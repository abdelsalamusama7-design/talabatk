import { useState, useMemo, useRef, useEffect } from "react";
import { Search, X, Store, ShoppingBag } from "lucide-react";
import { stores } from "@/lib/data";
import { useNavigate } from "react-router-dom";

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

const SearchOverlay = ({ open, onClose }: SearchOverlayProps) => {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery("");
    }
  }, [open]);

  const results = useMemo(() => {
    if (!query.trim()) return { stores: [], products: [] };
    const q = query.trim().toLowerCase();

    const matchedStores = stores.filter(
      (s) =>
        s.name.includes(q) ||
        s.category.includes(q)
    );

    const matchedProducts = stores.flatMap((s) =>
      s.products
        .filter((p) => p.name.includes(q) || p.description.includes(q))
        .map((p) => ({ ...p, store: s }))
    );

    return { stores: matchedStores, products: matchedProducts };
  }, [query]);

  if (!open) return null;

  const hasResults = results.stores.length > 0 || results.products.length > 0;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm" dir="rtl">
      <div className="pt-10 px-4">
        {/* Search Input */}
        <div className="relative flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث عن متاجر أو منتجات..."
              className="w-full h-12 rounded-xl bg-card text-foreground placeholder:text-muted-foreground px-4 pr-12 text-sm shadow-card focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          </div>
          <button
            onClick={onClose}
            className="h-12 w-12 rounded-xl bg-card shadow-card flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Results */}
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          {query.trim() && !hasResults && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">لا توجد نتائج لـ "{query}"</p>
            </div>
          )}

          {results.stores.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                <Store className="h-4 w-4" />
                المتاجر
              </h3>
              <div className="space-y-2">
                {results.stores.map((store) => (
                  <button
                    key={store.id}
                    onClick={() => {
                      onClose();
                      navigate(`/store/${store.id}`);
                    }}
                    className="w-full flex items-center gap-3 bg-card rounded-xl p-3 shadow-card hover:shadow-card-hover transition-shadow text-right"
                  >
                    <img
                      src={store.image}
                      alt={store.name}
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-foreground text-sm">{store.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {store.category} • ⭐ {store.rating} • {store.deliveryTime} دقيقة
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {results.products.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                <ShoppingBag className="h-4 w-4" />
                المنتجات
              </h3>
              <div className="space-y-2">
                {results.products.map((product) => (
                  <button
                    key={`${product.store.id}-${product.id}`}
                    onClick={() => {
                      onClose();
                      navigate(`/store/${product.store.id}`);
                    }}
                    className="w-full flex items-center gap-3 bg-card rounded-xl p-3 shadow-card hover:shadow-card-hover transition-shadow text-right"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-foreground text-sm">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.store.name}</p>
                    </div>
                    <span className="font-bold text-primary text-sm tabular-nums">
                      {product.price} ج.م
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {!query.trim() && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">ابدأ الكتابة للبحث...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchOverlay;
