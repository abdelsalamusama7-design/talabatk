import LocationHeader from "@/components/LocationHeader";
import CategoryGrid from "@/components/CategoryGrid";
import StoreCard from "@/components/StoreCard";
import { stores } from "@/lib/data";

const Index = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      <LocationHeader />
      <CategoryGrid />

      <section className="px-4" dir="rtl">
        <h2 className="text-lg font-semibold text-foreground mb-4">اكتشف كل المتاجر</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stores.map((store) => (
            <StoreCard key={store.id} store={store} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Index;
