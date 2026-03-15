import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix leaflet default icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const deliveryIcon = new L.DivIcon({
  html: `<div style="background:hsl(199 89% 48%);width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);font-size:18px;">🏍️</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  className: "",
});

const storeIcon = new L.DivIcon({
  html: `<div style="background:hsl(38 92% 50%);width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);font-size:18px;">🏪</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  className: "",
});

const customerIcon = new L.DivIcon({
  html: `<div style="background:hsl(152 69% 41%);width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);font-size:18px;">📍</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  className: "",
});

// Simulated route points in Cairo
const storePos: [number, number] = [30.0444, 31.2357];
const customerPos: [number, number] = [30.0511, 31.2497];
const routePoints: [number, number][] = [
  storePos,
  [30.0450, 31.2380],
  [30.0460, 31.2410],
  [30.0475, 31.2440],
  [30.0490, 31.2460],
  [30.0500, 31.2480],
  customerPos,
];

const AnimateMap = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 14, { duration: 1 });
  }, [center, map]);
  return null;
};

interface DeliveryMapProps {
  deliveryPerson: string;
}

const DeliveryMap = ({ deliveryPerson }: DeliveryMapProps) => {
  const [driverPos, setDriverPos] = useState<[number, number]>(routePoints[0]);
  const stepRef = useRef(0);

  // Simulate driver movement
  useEffect(() => {
    const interval = setInterval(() => {
      stepRef.current = (stepRef.current + 1) % routePoints.length;
      setDriverPos(routePoints[stepRef.current]);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-2xl overflow-hidden shadow-card border border-border" dir="rtl">
      <div className="bg-card px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
          </span>
          <span className="text-sm font-semibold text-foreground">تتبع مباشر</span>
        </div>
        <span className="text-xs text-muted-foreground">🏍️ {deliveryPerson}</span>
      </div>
      <MapContainer
        center={[30.0475, 31.2430]}
        zoom={14}
        style={{ height: "250px", width: "100%" }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <AnimateMap center={driverPos} />

        <Marker position={storePos} icon={storeIcon}>
          <Popup>المتجر</Popup>
        </Marker>

        <Marker position={customerPos} icon={customerIcon}>
          <Popup>موقعك</Popup>
        </Marker>

        <Marker position={driverPos} icon={deliveryIcon}>
          <Popup>{deliveryPerson}</Popup>
        </Marker>

        <Polyline
          positions={routePoints}
          pathOptions={{ color: "hsl(199, 89%, 48%)", weight: 4, dashArray: "10 6" }}
        />
      </MapContainer>
    </div>
  );
};

export default DeliveryMap;
