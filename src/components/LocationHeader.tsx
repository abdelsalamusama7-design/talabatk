import { MapPin, Search } from "lucide-react";
import { useState } from "react";
import SearchOverlay from "./SearchOverlay";

const LocationHeader = () => {
  const [address] = useState("شارع التحرير، القاهرة");
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <div className="bg-primary pt-10 pb-6 px-4 rounded-b-[2rem]">
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-primary-foreground text-sm font-medium">التوصيل إلى</span>
          <button className="flex items-center gap-1 text-primary-foreground">
            <span className="font-semibold text-sm">{address}</span>
            <MapPin className="h-4 w-4" />
            <span className="relative flex h-2 w-2">
              <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-primary-foreground opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-foreground"></span>
            </span>
          </button>
        </div>
        <button
          onClick={() => setSearchOpen(true)}
          className="w-full h-12 rounded-xl bg-card text-muted-foreground px-4 pr-12 text-sm shadow-card flex items-center gap-2 relative"
        >
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <span>ابحث عن متاجر أو منتجات...</span>
        </button>
      </div>
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

export default LocationHeader;
