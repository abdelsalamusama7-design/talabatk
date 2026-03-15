import { useState } from "react";
import LocationHeader from "@/components/LocationHeader";
import CategoryGrid from "@/components/CategoryGrid";
import TrendingMeals from "@/components/TrendingMeals";
import OffersSection from "@/components/OffersSection";
import StoreCard from "@/components/StoreCard";
import AiFoodChat from "@/components/AiFoodChat";
import { stores } from "@/lib/data";
import { Sparkles, MessageCircle } from "lucide-react";

const Index = () => {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background pb-20">
      <LocationHeader />
      <OffersSection />
      <CategoryGrid />
      <TrendingMeals />

      <section className="px-4" dir="rtl">
        <h2 className="text-lg font-semibold text-foreground mb-4">اكتشف كل المتاجر</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stores.map((store) => (
            <StoreCard key={store.id} store={store} />
          ))}
        </div>
      </section>

      {/* AI Chat FAB */}
      <button
        onClick={() => setChatOpen(true)}
        className="fixed bottom-24 left-4 z-40 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
      >
        <Sparkles className="h-6 w-6" />
      </button>

      {/* WhatsApp FAB */}
      <a
        href="https://wa.me/2001140872325"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-24 right-4 z-40 w-14 h-14 rounded-full bg-[hsl(142,70%,45%)] text-white shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
      >
        <MessageCircle className="h-6 w-6" />
      </a>

      <AiFoodChat open={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
};

export default Index;
