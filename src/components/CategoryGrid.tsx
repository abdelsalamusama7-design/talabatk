import { categories } from "@/lib/data";
import { useNavigate } from "react-router-dom";
import { useLang } from "@/lib/lang-context";

const catNameMap: Record<string, { ar: string; en: string }> = {
  "المطاعم": { ar: "المطاعم", en: "Restaurants" },
  "صيدليات": { ar: "صيدليات", en: "Pharmacy" },
  "سوبر ماركت": { ar: "سوبر ماركت", en: "Supermarket" },
  "البقالة": { ar: "البقالة", en: "Grocery" },
  "خضار": { ar: "خضار", en: "Vegetables" },
  "فواكه": { ar: "فواكه", en: "Fruits" },
  "عصائر": { ar: "عصائر", en: "Juices" },
  "حلويات": { ar: "حلويات", en: "Sweets" },
  "إلكترونيات": { ar: "إلكترونيات", en: "Electronics" },
  "كشك": { ar: "كشك", en: "Kiosk" },
  "لحوم ودواجن": { ar: "لحوم ودواجن", en: "Meat & Poultry" },
  "خدمات": { ar: "خدمات", en: "Services" },
};

const CategoryGrid = () => {
  const navigate = useNavigate();
  const { lang, dir } = useLang();

  return (
    <section className="px-4 py-6" dir={dir}>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => navigate(`/category/${cat.id}`)}
            className="flex flex-col items-center gap-2 min-w-[80px] group"
          >
            <div className="w-[72px] h-[72px] rounded-2xl overflow-hidden shadow-card bg-card transition-transform group-hover:scale-105">
              <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
            </div>
            <span className="text-xs font-semibold text-foreground">
              {catNameMap[cat.name]?.[lang] || cat.name}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
};

export default CategoryGrid;
