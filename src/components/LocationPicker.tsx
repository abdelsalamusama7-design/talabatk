import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Loader2, Navigation, X } from "lucide-react";

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

const FlyTo = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
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
  const [selectedPos, setSelectedPos] = useState<[number, number]>([
    currentLat || 30.0444,
    currentLng || 31.2357,
  ]);
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    if (currentLat && currentLng) {
      setSelectedPos([currentLat, currentLng]);
    }
  }, [currentLat, currentLng]);

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
      <div className="bg-primary px-4 pt-10 pb-4 flex items-center justify-between rounded-b-2xl">
        <h2 className="text-lg font-bold text-primary-foreground">حدد موقعك</h2>
        <button onClick={onClose} className="bg-card/20 rounded-full p-2">
          <X className="h-5 w-5 text-primary-foreground" />
        </button>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
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
          اضغط على الخريطة لتحديد الموقع أو استخدم GPS
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
