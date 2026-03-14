import { categories } from "@/lib/data";
import { useNavigate } from "react-router-dom";

const CategoryGrid = () => {
  const navigate = useNavigate();

  return (
    <section className="px-4 py-6" dir="rtl">
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
            <span className="text-xs font-semibold text-foreground">{cat.name}</span>
          </button>
        ))}
      </div>
    </section>
  );
};

export default CategoryGrid;
