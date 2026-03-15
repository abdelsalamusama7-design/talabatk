import { useEffect, useRef, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

// Fix leaflet default icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const createIcon = (emoji: string, bg: string, size = 40) =>
  new L.DivIcon({
    html: `<div style="background:${bg};width:${size}px;height:${size}px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 4px 12px rgba(0,0,0,0.25);font-size:${size * 0.5}px;transition:transform 0.3s ease;">${emoji}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    className: "",
  });

const deliveryIcon = createIcon("🏍️", "hsl(199,89%,48%)", 44);
const storeIcon = createIcon("🏪", "hsl(38,92%,50%)");
const customerIcon = createIcon("📍", "hsl(152,69%,41%)");

interface LiveDeliveryMapProps {
  storeLat?: number;
  storeLng?: number;
  customerLat?: number;
  customerLng?: number;
  driverName: string;
  orderStatus: string;
  driverId?: string | null;
  compact?: boolean;
}

// Smooth map panning to follow driver
const SmoothFollow = ({ position, active }: { position: [number, number]; active: boolean }) => {
  const map = useMap();
  const prevPos = useRef(position);
  
  useEffect(() => {
    if (!active) return;
    const [prevLat, prevLng] = prevPos.current;
    const [newLat, newLng] = position;
    if (Math.abs(newLat - prevLat) > 0.00001 || Math.abs(newLng - prevLng) > 0.00001) {
      map.panTo(position, { animate: true, duration: 1.5, easeLinearity: 0.25 });
      prevPos.current = position;
    }
  }, [position, map, active]);
  
  return null;
};

// Interpolate between two positions for smooth animation
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const LiveDeliveryMap = ({
  storeLat = 30.0444,
  storeLng = 31.2357,
  customerLat = 30.0511,
  customerLng = 31.2497,
  driverName,
  orderStatus,
  driverId,
  compact = false,
}: LiveDeliveryMapProps) => {
  const storePos: [number, number] = [storeLat, storeLng];
  const customerPos: [number, number] = [customerLat, customerLng];

  // Generate curved route points
  const routePoints = useMemo(() => {
    const steps = 20;
    const points: [number, number][] = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const curve = Math.sin(t * Math.PI) * 0.003;
      const jitter = (Math.random() - 0.5) * 0.0005;
      points.push([
        storeLat + (customerLat - storeLat) * t + curve,
        storeLng + (customerLng - storeLng) * t + jitter,
      ]);
    }
    return points;
  }, [storeLat, storeLng, customerLat, customerLng]);

  // Real driver position from DB (or simulated)
  const [targetPos, setTargetPos] = useState<[number, number]>(storePos);
  const [displayPos, setDisplayPos] = useState<[number, number]>(storePos);
  const [progress, setProgress] = useState(0);
  const [trail, setTrail] = useState<[number, number][]>([storePos]);
  const [eta, setEta] = useState(25);
  const stepRef = useRef(0);
  const animFrameRef = useRef<number>();

  // Smooth interpolation between target positions (60fps)
  useEffect(() => {
    let start: number | null = null;
    const startPos = [...displayPos] as [number, number];
    const duration = 2800; // slightly less than update interval for smooth overlap

    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const t = Math.min(elapsed / duration, 1);
      // Ease-out cubic for natural deceleration
      const eased = 1 - Math.pow(1 - t, 3);
      
      const newLat = lerp(startPos[0], targetPos[0], eased);
      const newLng = lerp(startPos[1], targetPos[1], eased);
      setDisplayPos([newLat, newLng]);
      
      if (t < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [targetPos]);

  // Real-time driver location from Supabase (every 3 seconds)
  useEffect(() => {
    if (!driverId) return;
    if (orderStatus !== "delivering" && orderStatus !== "picked_up") return;

    // Initial fetch
    const fetchLocation = async () => {
      const { data } = await supabase
        .from("drivers")
        .select("current_lat, current_lng")
        .eq("id", driverId)
        .maybeSingle();
      if (data?.current_lat && data?.current_lng) {
        setTargetPos([data.current_lat, data.current_lng]);
        setTrail((prev) => [...prev, [data.current_lat, data.current_lng]]);
      }
    };
    fetchLocation();

    // Realtime subscription
    const channel = supabase
      .channel(`driver-location-${driverId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "drivers",
          filter: `id=eq.${driverId}`,
        },
        (payload) => {
          const { current_lat, current_lng } = payload.new as any;
          if (current_lat && current_lng) {
            setTargetPos([current_lat, current_lng]);
            setTrail((prev) => {
              const newTrail = [...prev, [current_lat, current_lng] as [number, number]];
              return newTrail.slice(-50); // Keep last 50 points
            });
          }
        }
      )
      .subscribe();

    // Polling fallback every 3 seconds
    const interval = setInterval(fetchLocation, 3000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [driverId, orderStatus]);

  // Simulated movement when no real driver ID
  useEffect(() => {
    if (driverId) return;
    if (orderStatus !== "delivering" && orderStatus !== "picked_up") {
      setTargetPos(storePos);
      setDisplayPos(storePos);
      return;
    }

    const interval = setInterval(() => {
      stepRef.current = Math.min(stepRef.current + 1, routePoints.length - 1);
      const newPos = routePoints[stepRef.current];
      setTargetPos(newPos);
      setTrail((prev) => [...prev, newPos]);
      const pct = Math.round((stepRef.current / (routePoints.length - 1)) * 100);
      setProgress(pct);
      setEta(Math.max(2, 25 - Math.floor(pct / 4)));
    }, 3000);

    return () => clearInterval(interval);
  }, [orderStatus, routePoints, storePos, driverId]);

  // Calculate progress from real positions
  useEffect(() => {
    if (!driverId) return;
    const totalDist = Math.sqrt(
      Math.pow(customerLat - storeLat, 2) + Math.pow(customerLng - storeLng, 2)
    );
    const coveredDist = Math.sqrt(
      Math.pow(targetPos[0] - storeLat, 2) + Math.pow(targetPos[1] - storeLng, 2)
    );
    const pct = totalDist > 0 ? Math.min(100, Math.round((coveredDist / totalDist) * 100)) : 0;
    setProgress(pct);
    setEta(Math.max(2, 25 - Math.floor(pct / 4)));
  }, [targetPos, driverId, storeLat, storeLng, customerLat, customerLng]);

  const center: [number, number] = [
    (storeLat + customerLat) / 2,
    (storeLng + customerLng) / 2,
  ];

  // Full route line (dashed)
  const isMoving = orderStatus === "delivering" || orderStatus === "picked_up";

  return (
    <div className="rounded-2xl overflow-hidden shadow-card border border-border">
      {/* Live header */}
      <div className="bg-card px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${isMoving ? "animate-ping bg-success" : "bg-muted-foreground"}`} />
            <span className={`relative inline-flex rounded-full h-3 w-3 ${isMoving ? "bg-success" : "bg-muted-foreground"}`} />
          </span>
          <span className="text-sm font-semibold text-foreground">
            {isMoving ? "تتبع مباشر" : "الخريطة"}
          </span>
          {isMoving && (
            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
              كل 3 ثوانٍ
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isMoving && (
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
        <SmoothFollow position={displayPos} active={isMoving} />

        {/* Store marker */}
        <Marker position={storePos} icon={storeIcon}>
          <Popup>المتجر</Popup>
        </Marker>

        {/* Customer marker */}
        <Marker position={customerPos} icon={customerIcon}>
          <Popup>موقع التسليم</Popup>
        </Marker>

        {/* Driver marker with smooth position */}
        <Marker position={displayPos} icon={deliveryIcon}>
          <Popup>{driverName}</Popup>
        </Marker>

        {/* Driver accuracy circle */}
        {isMoving && (
          <Circle
            center={displayPos}
            radius={50}
            pathOptions={{
              color: "hsl(199,89%,48%)",
              fillColor: "hsl(199,89%,48%)",
              fillOpacity: 0.1,
              weight: 1,
            }}
          />
        )}

        {/* Completed trail (solid blue) */}
        {trail.length > 1 && (
          <Polyline
            positions={trail}
            pathOptions={{ color: "hsl(199,89%,48%)", weight: 5, opacity: 0.9, lineCap: "round", lineJoin: "round" }}
          />
        )}

        {/* Full route preview (dashed) */}
        <Polyline
          positions={[storePos, ...routePoints, customerPos]}
          pathOptions={{ color: "hsl(199,89%,48%)", weight: 3, dashArray: "6 10", opacity: 0.25 }}
        />
      </MapContainer>

      {/* ETA bar */}
      <div className="bg-card px-4 py-2.5 flex items-center justify-between border-t border-border">
        <div className="flex items-center gap-2">
          <span className="text-lg">⏱️</span>
          <div>
            <p className="text-xs text-muted-foreground">الوقت المتوقع</p>
            <p className="text-sm font-bold text-foreground">
              {orderStatus === "preparing" ? "15-25 دقيقة" : `${eta}-${eta + 5} دقيقة`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              animate={{ width: `${Math.max(5, progress)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
          {isMoving && (
            <motion.div
              className="w-2 h-2 rounded-full bg-success"
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveDeliveryMap;
