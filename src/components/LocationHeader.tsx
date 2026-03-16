import { MapPin, Search, Loader2, Bell, User, Moon, Sun, Globe, RefreshCw, Download } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SearchOverlay from "./SearchOverlay";
import LocationPicker from "./LocationPicker";
import NotificationsPanel from "./NotificationsPanel";
import { useGeolocation } from "@/hooks/use-geolocation";
import { useLang } from "@/lib/lang-context";

const LocationHeader = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
  const geo = useGeolocation();
  const navigate = useNavigate();
  const { lang, setLang, t } = useLang();

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  return (
    <>
      <div className="bg-primary pt-10 pb-6 px-4 rounded-b-[2rem]">
        <div className="max-w-7xl mx-auto">
        {/* Top bar with icons */}
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/account")}
              className="h-9 w-9 rounded-full bg-primary-foreground/15 flex items-center justify-center hover:bg-primary-foreground/25 transition-colors"
            >
              <User className="h-[18px] w-[18px] text-primary-foreground" />
            </button>
            <button
              onClick={() => setDark(!dark)}
              className="h-9 w-9 rounded-full bg-primary-foreground/15 flex items-center justify-center hover:bg-primary-foreground/25 transition-colors"
            >
              {dark ? (
                <Sun className="h-[18px] w-[18px] text-primary-foreground" />
              ) : (
                <Moon className="h-[18px] w-[18px] text-primary-foreground" />
              )}
            </button>
            <button
              onClick={() => setLang(lang === "ar" ? "en" : "ar")}
              className="h-9 rounded-full bg-primary-foreground/15 flex items-center justify-center hover:bg-primary-foreground/25 transition-colors px-2.5 gap-1.5"
            >
              <Globe className="h-[18px] w-[18px] text-primary-foreground" />
              <span className="text-[11px] font-bold text-primary-foreground">{lang === "ar" ? "EN" : "عربي"}</span>
            </button>
            <button
              onClick={() => window.location.reload()}
              className="h-9 w-9 rounded-full bg-primary-foreground/15 flex items-center justify-center hover:bg-primary-foreground/25 transition-colors"
            >
              <RefreshCw className="h-[18px] w-[18px] text-primary-foreground" />
            </button>
            <button
              onClick={() => navigate("/install")}
              className="h-9 w-9 rounded-full bg-primary-foreground/15 flex items-center justify-center hover:bg-primary-foreground/25 transition-colors"
              aria-label="Install App"
            >
              <Download className="h-[18px] w-[18px] text-primary-foreground" />
          </div>
          <button
            onClick={() => setNotifOpen(true)}
            className="h-9 w-9 rounded-full bg-primary-foreground/15 flex items-center justify-center hover:bg-primary-foreground/25 transition-colors relative"
          >
            <Bell className="h-[18px] w-[18px] text-primary-foreground" />
            <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-destructive border-2 border-primary" />
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-primary-foreground text-sm font-medium">{t("header.deliverTo")}</span>
          <button
            onClick={() => setMapOpen(true)}
            className="flex items-center gap-1 text-primary-foreground"
          >
            {geo.loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <span className="font-semibold text-sm max-w-[200px] truncate">{geo.address}</span>
                <MapPin className="h-4 w-4" />
                <span className="relative flex h-2 w-2">
                  <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-primary-foreground opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-foreground"></span>
                </span>
              </>
            )}
          </button>
        </div>
        <button
          onClick={() => setSearchOpen(true)}
          className="w-full h-12 rounded-xl bg-card text-muted-foreground px-4 pr-12 text-sm shadow-card flex items-center gap-2 relative"
        >
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <span>{t("header.search")}</span>
        </button>
        </div>
      </div>
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <LocationPicker
        open={mapOpen}
        onClose={() => setMapOpen(false)}
        onSelect={geo.setManualLocation}
        currentLat={geo.lat}
        currentLng={geo.lng}
        loading={geo.loading}
        onRequestGPS={geo.requestLocation}
      />
      <NotificationsPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
    </>
  );
};

export default LocationHeader;
