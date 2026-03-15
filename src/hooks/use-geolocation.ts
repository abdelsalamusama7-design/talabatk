import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface GeoState {
  lat: number | null;
  lng: number | null;
  address: string;
  loading: boolean;
  error: string | null;
}

const DEFAULT_ADDRESS = "شارع التحرير، القاهرة";

export const useGeolocation = () => {
  const [state, setState] = useState<GeoState>({
    lat: Number(localStorage.getItem("user_lat")) || null,
    lng: Number(localStorage.getItem("user_lng")) || null,
    address: localStorage.getItem("user_address") || DEFAULT_ADDRESS,
    loading: false,
    error: null,
  });

  // Auto-load default saved address on mount
  useEffect(() => {
    const loadDefault = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("saved_addresses")
        .select("lat, lng, address")
        .eq("user_id", user.id)
        .eq("is_default", true)
        .maybeSingle();

      if (data) {
        localStorage.setItem("user_address", data.address);
        localStorage.setItem("user_lat", String(data.lat));
        localStorage.setItem("user_lng", String(data.lng));
        setState((s) => ({
          ...s,
          lat: data.lat,
          lng: data.lng,
          address: data.address,
        }));
      }
    };

    // Only load if no address was manually set
    if (!localStorage.getItem("user_lat")) {
      loadDefault();
    }
  }, []);

  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=ar`
      );
      const data = await res.json();
      const parts = [];
      if (data.address?.road) parts.push(data.address.road);
      if (data.address?.suburb) parts.push(data.address.suburb);
      if (data.address?.city || data.address?.town) parts.push(data.address.city || data.address.town);
      return parts.length > 0 ? parts.join("، ") : `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch {
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  };

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState((s) => ({ ...s, error: "المتصفح لا يدعم تحديد الموقع" }));
      return;
    }

    setState((s) => ({ ...s, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const address = await reverseGeocode(latitude, longitude);
        localStorage.setItem("user_address", address);
        localStorage.setItem("user_lat", String(latitude));
        localStorage.setItem("user_lng", String(longitude));
        setState({ lat: latitude, lng: longitude, address, loading: false, error: null });
      },
      (err) => {
        const messages: Record<number, string> = {
          1: "تم رفض إذن الموقع. يرجى السماح بالوصول للموقع",
          2: "تعذر تحديد الموقع. حاول مرة أخرى",
          3: "انتهت مهلة تحديد الموقع",
        };
        setState((s) => ({
          ...s,
          loading: false,
          error: messages[err.code] || "حدث خطأ في تحديد الموقع",
        }));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  const setManualLocation = useCallback((lat: number, lng: number, address: string) => {
    localStorage.setItem("user_address", address);
    localStorage.setItem("user_lat", String(lat));
    localStorage.setItem("user_lng", String(lng));
    setState({ lat, lng, address, loading: false, error: null });
  }, []);

  return { ...state, requestLocation, setManualLocation };
};
