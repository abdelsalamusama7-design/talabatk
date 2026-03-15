import { useEffect, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Loader2, Navigation, X, Search, Star, Trash2, Home, Briefcase, Heart, Edit3, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

const pinIcon = new L.DivIcon({
  html: `<div style="background:hsl(199 89% 48%);width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 4px 12px rgba(0,0,0,0.3);font-size:20px;">📍</div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  className: "",
});

interface LocationPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (lat: number, lng: number, address: string) => void;
  currentLat?: number | null;
  currentLng?: number | null;
  loading?: boolean;
  onRequestGPS: () => void;
}

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
}

interface SavedAddress {
  id: string;
  label: string;
  address: string;
  lat: number;
  lng: number;
  is_default: boolean;
}

const LABEL_ICONS: Record<string, typeof Home> = {
  "المنزل": Home,
  "العمل": Briefcase,
  "مفضل": Heart,
};

const FlyTo = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    // Invalidate size on first render to fix white map issue
    setTimeout(() => map.invalidateSize(), 100);
    map.flyTo(center, 16, { duration: 1.2 });
  }, [center, map]);
  return null;
};

const DraggableMarker = ({
  position,
  onMove,
}: {
  position: [number, number];
  onMove: (lat: number, lng: number) => void;
}) => {
  const [pos, setPos] = useState<[number, number]>(position);

  useEffect(() => {
    setPos(position);
  }, [position]);

  useMapEvents({
    click(e) {
      setPos([e.latlng.lat, e.latlng.lng]);
      onMove(e.latlng.lat, e.latlng.lng);
    },
  });

  return <Marker position={pos} icon={pinIcon} />;
};

const LocationPicker = ({
  open,
  onClose,
  onSelect,
  currentLat,
  currentLng,
  loading,
  onRequestGPS,
}: LocationPickerProps) => {
  const { user } = useAuth();
  const [selectedPos, setSelectedPos] = useState<[number, number]>([
    currentLat || 30.0444,
    currentLng || 31.2357,
  ]);
  const [resolving, setResolving] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Saved addresses state
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [showSaved, setShowSaved] = useState(false);
  const [saveLabel, setSaveLabel] = useState("المنزل");
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");

  useEffect(() => {
    if (currentLat && currentLng) {
      setSelectedPos([currentLat, currentLng]);
    }
  }, [currentLat, currentLng]);

  // Load saved addresses
  useEffect(() => {
    if (!user || !open) return;
    const load = async () => {
      const { data } = await supabase
        .from("saved_addresses")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (data) setSavedAddresses(data as SavedAddress[]);
    };
    load();
  }, [user, open]);

  // Search with debounce
  const handleSearch = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    setSearching(true);
    setShowResults(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&accept-language=ar&countrycodes=eg`
      );
      const data: SearchResult[] = await res.json();
      setSearchResults(data);
    } catch {
      setSearchResults([]);
    }
    setSearching(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => handleSearch(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery, handleSearch]);

  const selectSearchResult = (result: SearchResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setSelectedPos([lat, lng]);
    setSearchQuery(result.display_name.split(",").slice(0, 3).join("،"));
    setShowResults(false);
  };

  const selectSavedAddress = (addr: SavedAddress) => {
    setSelectedPos([addr.lat, addr.lng]);
    setShowSaved(false);
    // Directly select and close
    onSelect(addr.lat, addr.lng, addr.address);
    onClose();
  };

  const saveCurrentAddress = async () => {
    if (!user) {
      toast.error("سجل دخولك أولاً لحفظ العناوين");
      return;
    }
    setResolving(true);
    try {
      // Reverse geocode to get address
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${selectedPos[0]}&lon=${selectedPos[1]}&format=json&accept-language=ar`
      );
      const data = await res.json();
      const parts = [];
      if (data.address?.road) parts.push(data.address.road);
      if (data.address?.suburb) parts.push(data.address.suburb);
      if (data.address?.city || data.address?.town) parts.push(data.address.city || data.address.town);
      const address = parts.length > 0 ? parts.join("، ") : `${selectedPos[0].toFixed(4)}, ${selectedPos[1].toFixed(4)}`;

      const { error } = await supabase.from("saved_addresses").insert({
        user_id: user.id,
        label: saveLabel,
        address,
        lat: selectedPos[0],
        lng: selectedPos[1],
      });

      if (error) throw error;
      toast.success("تم حفظ العنوان بنجاح ⭐");
      setShowSaveForm(false);
      // Reload saved addresses
      const { data: updated } = await supabase
        .from("saved_addresses")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (updated) setSavedAddresses(updated as SavedAddress[]);
    } catch {
      toast.error("حدث خطأ أثناء حفظ العنوان");
    }
    setResolving(false);
  };

  const deleteSavedAddress = async (id: string) => {
    const { error } = await supabase.from("saved_addresses").delete().eq("id", id);
    if (!error) {
      setSavedAddresses((prev) => prev.filter((a) => a.id !== id));
      toast.success("تم حذف العنوان");
    }
  };

  const updateAddressLabel = async (id: string, newLabel: string) => {
    if (!newLabel.trim()) return;
    const { error } = await supabase
      .from("saved_addresses")
      .update({ label: newLabel.trim() })
      .eq("id", id);
    if (!error) {
      setSavedAddresses((prev) =>
        prev.map((a) => (a.id === id ? { ...a, label: newLabel.trim() } : a))
      );
      toast.success("تم تعديل اسم العنوان");
    }
    setEditingId(null);
  };

  const setAsDefault = async (id: string) => {
    if (!user) return;
    // Remove default from all
    await supabase
      .from("saved_addresses")
      .update({ is_default: false })
      .eq("user_id", user.id);
    // Set new default
    await supabase
      .from("saved_addresses")
      .update({ is_default: true })
      .eq("id", id);
    setSavedAddresses((prev) =>
      prev.map((a) => ({ ...a, is_default: a.id === id }))
    );
    toast.success("تم تعيين العنوان الافتراضي ⭐");
  };

  if (!open) return null;

  const handleConfirm = async () => {
    setResolving(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${selectedPos[0]}&lon=${selectedPos[1]}&format=json&accept-language=ar`
      );
      const data = await res.json();
      const parts = [];
      if (data.address?.road) parts.push(data.address.road);
      if (data.address?.suburb) parts.push(data.address.suburb);
      if (data.address?.city || data.address?.town) parts.push(data.address.city || data.address.town);
      const address = parts.length > 0 ? parts.join("، ") : `${selectedPos[0].toFixed(4)}, ${selectedPos[1].toFixed(4)}`;
      onSelect(selectedPos[0], selectedPos[1], address);
    } catch {
      onSelect(selectedPos[0], selectedPos[1], `${selectedPos[0].toFixed(4)}, ${selectedPos[1].toFixed(4)}`);
    }
    setResolving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col" dir="rtl">
      {/* Header */}
      <div className="bg-primary px-4 pt-10 pb-4 rounded-b-2xl space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-primary-foreground">حدد موقعك</h2>
          <button onClick={onClose} className="bg-card/20 rounded-full p-2">
            <X className="h-5 w-5 text-primary-foreground" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ابحث عن عنوان أو منطقة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10 rounded-xl h-10 bg-card text-foreground border-none text-sm"
            onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
          />
          {searching && (
            <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>

        {/* Quick actions */}
        <div className="flex gap-2">
          {user && savedAddresses.length > 0 && (
            <button
              onClick={() => { setShowSaved(!showSaved); setShowResults(false); }}
              className="text-xs bg-card/20 text-primary-foreground px-3 py-1.5 rounded-full flex items-center gap-1"
            >
              <Star className="h-3 w-3" /> عناويني ({savedAddresses.length})
            </button>
          )}
          <button
            onClick={() => { setShowSaveForm(!showSaveForm); setShowSaved(false); setShowResults(false); }}
            className="text-xs bg-card/20 text-primary-foreground px-3 py-1.5 rounded-full flex items-center gap-1"
          >
            <Star className="h-3 w-3" /> حفظ الموقع الحالي
          </button>
        </div>
      </div>

      {/* Search Results Dropdown */}
      {showResults && searchResults.length > 0 && (
        <div className="mx-4 mt-1 bg-card rounded-xl shadow-lg border border-border overflow-hidden z-[1001] relative">
          {searchResults.map((result, i) => (
            <button
              key={i}
              onClick={() => selectSearchResult(result)}
              className="w-full text-right px-4 py-3 text-sm hover:bg-accent transition-colors border-b border-border last:border-b-0 flex items-start gap-2"
            >
              <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <span className="text-foreground line-clamp-2">
                {result.display_name}
              </span>
            </button>
          ))}
        </div>
      )}

      {showResults && searchQuery.length >= 2 && searchResults.length === 0 && !searching && (
        <div className="mx-4 mt-1 bg-card rounded-xl shadow-lg border border-border p-4 text-center text-sm text-muted-foreground z-[1001] relative">
          لا توجد نتائج لـ "{searchQuery}"
        </div>
      )}

      {/* Saved Addresses Dropdown */}
      {showSaved && savedAddresses.length > 0 && (
        <div className="mx-4 mt-1 bg-card rounded-xl shadow-lg border border-border overflow-hidden z-[1001] relative max-h-72 overflow-y-auto">
          {savedAddresses.map((addr) => {
            const IconComp = LABEL_ICONS[addr.label] || MapPin;
            const isEditing = editingId === addr.id;
            return (
              <div
                key={addr.id}
                className={`flex items-center gap-2 px-4 py-3 border-b border-border last:border-b-0 hover:bg-accent transition-colors ${addr.is_default ? "bg-primary/5" : ""}`}
              >
                <button
                  onClick={() => !isEditing && selectSavedAddress(addr)}
                  className="flex-1 flex items-start gap-2 text-right"
                >
                  <IconComp className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    {isEditing ? (
                      <Input
                        value={editLabel}
                        onChange={(e) => setEditLabel(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") updateAddressLabel(addr.id, editLabel);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        className="h-7 text-sm rounded-lg px-2"
                        autoFocus
                      />
                    ) : (
                      <>
                        <p className="text-sm font-medium text-foreground flex items-center gap-1">
                          {addr.label}
                          {addr.is_default && <span className="text-[10px] text-primary">(افتراضي)</span>}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{addr.address}</p>
                      </>
                    )}
                  </div>
                </button>
                <div className="flex items-center gap-1 shrink-0">
                  {isEditing ? (
                    <button
                      onClick={() => updateAddressLabel(addr.id, editLabel)}
                      className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => setAsDefault(addr.id)}
                        className={`p-1.5 rounded-lg transition-colors ${addr.is_default ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
                        title="تعيين كافتراضي"
                      >
                        <Star className={`h-3.5 w-3.5 ${addr.is_default ? "fill-current" : ""}`} />
                      </button>
                      <button
                        onClick={() => { setEditingId(addr.id); setEditLabel(addr.label); }}
                        className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => deleteSavedAddress(addr.id)}
                    className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Save Address Form */}
      {showSaveForm && (
        <div className="mx-4 mt-1 bg-card rounded-xl shadow-lg border border-border p-4 z-[1001] relative space-y-3">
          <p className="text-sm font-semibold text-foreground">حفظ الموقع الحالي</p>
          <div className="flex gap-2">
            {["المنزل", "العمل", "مفضل"].map((label) => {
              const IconComp = LABEL_ICONS[label] || MapPin;
              return (
                <Button
                  key={label}
                  size="sm"
                  variant={saveLabel === label ? "default" : "outline"}
                  onClick={() => setSaveLabel(label)}
                  className="rounded-xl text-xs flex items-center gap-1"
                >
                  <IconComp className="h-3 w-3" /> {label}
                </Button>
              );
            })}
          </div>
          <div className="flex gap-2">
            <Button
              onClick={saveCurrentAddress}
              disabled={resolving}
              size="sm"
              className="rounded-xl flex-1"
            >
              {resolving ? <Loader2 className="h-4 w-4 animate-spin" /> : "حفظ ⭐"}
            </Button>
            <Button
              onClick={() => setShowSaveForm(false)}
              size="sm"
              variant="ghost"
              className="rounded-xl"
            >
              إلغاء
            </Button>
          </div>
        </div>
      )}

      {/* Map */}
      <div className="flex-1 min-h-0 relative">
        <MapContainer
          center={selectedPos}
          zoom={15}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <FlyTo center={selectedPos} />
          <DraggableMarker
            position={selectedPos}
            onMove={(lat, lng) => setSelectedPos([lat, lng])}
          />
        </MapContainer>

        {/* GPS Button */}
        <button
          onClick={onRequestGPS}
          disabled={loading}
          className="absolute bottom-24 left-4 z-[1000] bg-card rounded-full p-3 shadow-lg border border-border hover:bg-accent transition-colors"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 text-primary animate-spin" />
          ) : (
            <Navigation className="h-5 w-5 text-primary" />
          )}
        </button>
      </div>

      {/* Confirm Button */}
      <div className="p-4 bg-card border-t border-border">
        <p className="text-xs text-muted-foreground text-center mb-3">
          اضغط على الخريطة لتحديد الموقع أو ابحث عن عنوان
        </p>
        <button
          onClick={handleConfirm}
          disabled={resolving}
          className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          {resolving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MapPin className="h-4 w-4" />
          )}
          {resolving ? "جاري تحديد العنوان..." : "تأكيد الموقع"}
        </button>
      </div>
    </div>
  );
};

export default LocationPicker;
