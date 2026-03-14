import { useParams, useNavigate } from "react-router-dom";
import { stores, categories } from "@/lib/data";
import StoreCard from "@/components/StoreCard";
import { ArrowRight } from "lucide-react";

const CategoryPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const category = categories.find((c) => c.id === id);
  const filteredStores = stores.filter((s) => s.categoryId === id);

  return (
    <div className="min-h-screen bg-background pb-20" dir="rtl">
      <div className="bg-primary pt-10 pb-6 px-4 rounded-b-[2rem]">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="bg-card/20 rounded-full p-2">
            <ArrowRight className="h-5 w-5 text-primary-foreground" />
          </button>
          <h1 className="text-xl font-bold text-primary-foreground">
            {category?.name || "التصنيف"}
          </h1>
        </div>
      </div>

      <div className="px-4 pt-6">
        {filteredStores.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">لا توجد متاجر في هذا التصنيف حالياً</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredStores.map((store) => (
              <StoreCard key={store.id} store={store} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
