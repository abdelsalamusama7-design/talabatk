import { useEffect, useRef, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { motion } from "framer-motion";

// Fix leaflet default icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const createIcon = (emoji: string, bg: string) =>
  new L.DivIcon({
    html: `<div style="background:${bg};width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 4px 12px rgba(0,0,0,0.25);font-size:20px;">${emoji}</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    className: "",
  });

const deliveryIcon = createIcon("🏍️", "hsl(199,89%,48%)");
const storeIcon = createIcon("🏪", "hsl(38,92%,50%)");
const customerIcon = createIcon("📍", "hsl(152,69%,41%)");

interface LiveDeliveryMapProps {
  storeLat?: number;
  storeLng?: number;
  customerLat?: number;
  customerLng?: number;
  driverName: string;
  orderStatus: string;
  compact?: boolean;
}

const FlyToDriver = ({ position }: { position: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(position, map.getZoom(), { duration: 1.5 });
  }, [position, map]);
  return null;
};

const LiveDeliveryMap = ({
  storeLat = 30.0444,
  storeLng = 31.2357,
  customerLat = 30.0511,
  customerLng = 31.2497,
  driverName,
  orderStatus,
  compact = false,
}: LiveDeliveryMapProps) => {
  const storePos: [number, number] = [storeLat, storeLng];
  const customerPos: [number, number] = [customerLat, customerLng];

  // Generate route points between store and customer
  const routePoints = useMemo(() => {
    const steps = 8;
    const points: [number, number][] = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      // Add slight curve for realistic route
      const curve = Math.sin(t * Math.PI) * 0.003;
      points.push([
        storeLat + (customerLat - storeLat) * t + curve,
        storeLng + (customerLng - storeLng) * t,
      ]);
    }
    return points;
  }, [storeLat, storeLng, customerLat, customerLng]);

  const [driverPos, setDriverPos] = useState<[number, number]>(storePos);
  const [progress, setProgress] = useState(0);
  const stepRef = useRef(0);

  // Simulate driver movement along route
  useEffect(() => {
    if (orderStatus !== "delivering" && orderStatus !== "picked_up") {
      // If preparing, driver stays at store
      setDriverPos(storePos);
      return;
    }

    const interval = setInterval(() => {
      stepRef.current = Math.min(stepRef.current + 1, routePoints.length - 1);
      setDriverPos(routePoints[stepRef.current]);
      setProgress(Math.round((stepRef.current / (routePoints.length - 1)) * 100));
    }, 2500);

    return () => clearInterval(interval);
  }, [orderStatus, routePoints, storePos]);

  const center: [number, number] = [
    (storeLat + customerLat) / 2,
    (storeLng + customerLng) / 2,
  ];

  // Trail: points the driver has already passed
  const trail = routePoints.slice(0, stepRef.current + 1);
  const remaining = routePoints.slice(stepRef.current);

  return (
    <div className="rounded-2xl overflow-hidden shadow-card border border-border">
      {/* Live header */}
      <div className="bg-card px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-success" />
          </span>
          <span className="text-sm font-semibold text-foreground">تتبع مباشر</span>
        </div>
        <div className="flex items-center gap-2">
          {orderStatus === "delivering" && (
            <motion.div
              className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              {progress}%
            </motion.div>
          )}
          <span className="text-xs text-muted-foreground">🏍️ {driverName}</span>
        </div>
      </div>

      <MapContainer
        center={center}
        zoom={compact ? 13 : 14}
        style={{ height: compact ? "200px" : "300px", width: "100%" }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <FlyToDriver position={driverPos} />

        {/* Store marker */}
        <Marker position={storePos} icon={storeIcon}>
          <Popup>المتجر</Popup>
        </Marker>

        {/* Customer marker */}
        <Marker position={customerPos} icon={customerIcon}>
          <Popup>موقع التسليم</Popup>
        </Marker>

        {/* Driver marker */}
        <Marker position={driverPos} icon={deliveryIcon}>
          <Popup>{driverName}</Popup>
        </Marker>

        {/* Completed trail */}
        {trail.length > 1 && (
          <Polyline
            positions={trail}
            pathOptions={{ color: "hsl(199,89%,48%)", weight: 5, opacity: 1 }}
          />
        )}

        {/* Remaining route (dashed) */}
        {remaining.length > 1 && (
          <Polyline
            positions={remaining}
            pathOptions={{ color: "hsl(199,89%,48%)", weight: 4, dashArray: "8 8", opacity: 0.4 }}
          />
        )}
      </MapContainer>

      {/* ETA bar */}
      <div className="bg-card px-4 py-2 flex items-center justify-between border-t border-border">
        <div className="flex items-center gap-2">
          <span className="text-lg">⏱️</span>
          <div>
            <p className="text-xs text-muted-foreground">الوقت المتوقع</p>
            <p className="text-sm font-bold text-foreground">
              {orderStatus === "preparing" ? "15-25 دقيقة" : `${Math.max(5, 20 - Math.floor(progress / 5))}-${Math.max(10, 25 - Math.floor(progress / 5))} دقيقة`}
            </p>
          </div>
        </div>
        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            animate={{ width: `${Math.max(10, progress)}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    </div>
  );
};

export default LiveDeliveryMap;
