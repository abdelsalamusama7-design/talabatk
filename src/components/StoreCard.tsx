import { Star, Clock } from "lucide-react";
import { Store } from "@/lib/data";
import { useNavigate } from "react-router-dom";

interface StoreCardProps {
  store: Store;
}

const StoreCard = ({ store }: StoreCardProps) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/store/${store.id}`)}
      className="group relative bg-card rounded-2xl p-3 shadow-card transition-all hover:shadow-card-hover hover:-translate-y-0.5 text-right w-full"
      dir="rtl"
    >
      <div className="aspect-video rounded-xl overflow-hidden mb-3 bg-muted">
        <img
          src={store.image}
          alt={store.name}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute inset-x-3 bottom-0 h-16 bg-gradient-to-t from-black/30 to-transparent rounded-b-xl" />
      </div>
      <h3 className="text-base font-semibold text-foreground">{store.name}</h3>
      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
          {store.category}
        </span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <Star className="h-3.5 w-3.5 text-warning fill-warning" />
          <span className="tabular-nums">{store.rating}</span>
          <span className="text-xs">({store.reviewCount}+)</span>
        </span>
      </div>
      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
        <Clock className="h-3.5 w-3.5" />
        <span className="tabular-nums">{store.deliveryTime} دقيقة</span>
        {store.deliveryFee > 0 && (
          <>
            <span>•</span>
            <span>توصيل {store.deliveryFee} ج.م</span>
          </>
        )}
      </div>
    </button>
  );
};

export default StoreCard;
