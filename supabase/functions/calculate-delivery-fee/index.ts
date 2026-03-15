import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { restaurant_id, customer_lat, customer_lng } = await req.json();

    if (!restaurant_id || !customer_lat || !customer_lng) {
      return new Response(JSON.stringify({ error: "restaurant_id, customer_lat, customer_lng required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get restaurant location
    const { data: restaurant } = await supabase
      .from("restaurants")
      .select("lat, lng, delivery_fee")
      .eq("id", restaurant_id)
      .single();

    const restLat = restaurant?.lat || 30.0444;
    const restLng = restaurant?.lng || 31.2357;
    const baseFee = restaurant?.delivery_fee || 10;

    // Haversine distance
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(customer_lat - restLat);
    const dLng = toRad(customer_lng - restLng);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(restLat)) * Math.cos(toRad(customer_lat)) * Math.sin(dLng / 2) ** 2;
    const distanceKm = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    // Check peak hours (12-2 PM, 7-10 PM Egypt time)
    const now = new Date();
    const egyptHour = new Date(now.toLocaleString("en-US", { timeZone: "Africa/Cairo" })).getHours();
    const isPeak = (egyptHour >= 12 && egyptHour < 14) || (egyptHour >= 19 && egyptHour < 22);

    // Check demand: count pending orders in last 30 minutes
    const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    const { count: recentOrders } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .gte("created_at", thirtyMinsAgo)
      .in("status", ["pending", "confirmed", "preparing"]);

    const demandLevel = (recentOrders || 0) > 20 ? "high" : (recentOrders || 0) > 10 ? "medium" : "low";

    // Dynamic pricing formula
    let fee = baseFee;

    // Distance surcharge: +3 EGP per km after first 2km
    if (distanceKm > 2) {
      fee += Math.ceil(distanceKm - 2) * 3;
    }

    // Peak hour surcharge: +30%
    const peakMultiplier = isPeak ? 1.3 : 1.0;
    fee = Math.round(fee * peakMultiplier);

    // Demand surcharge
    if (demandLevel === "high") fee = Math.round(fee * 1.25);
    else if (demandLevel === "medium") fee = Math.round(fee * 1.1);

    // Cap fee
    fee = Math.min(fee, 80);
    fee = Math.max(fee, 5);

    return new Response(JSON.stringify({
      delivery_fee: fee,
      distance_km: Math.round(distanceKm * 10) / 10,
      is_peak: isPeak,
      demand_level: demandLevel,
      base_fee: baseFee,
      breakdown: {
        base: baseFee,
        distance_surcharge: distanceKm > 2 ? Math.ceil(distanceKm - 2) * 3 : 0,
        peak_multiplier: peakMultiplier,
        demand_multiplier: demandLevel === "high" ? 1.25 : demandLevel === "medium" ? 1.1 : 1.0,
      },
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
