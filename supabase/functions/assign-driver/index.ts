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

    const { order_id } = await req.json();
    if (!order_id) {
      return new Response(JSON.stringify({ error: "order_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get order details
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("*")
      .eq("id", order_id)
      .single();

    if (orderErr || !order) {
      return new Response(JSON.stringify({ error: "Order not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get available drivers with location
    const { data: drivers } = await supabase
      .from("drivers")
      .select("*")
      .eq("status", "available")
      .not("current_lat", "is", null)
      .not("current_lng", "is", null);

    if (!drivers || drivers.length === 0) {
      return new Response(JSON.stringify({ error: "No available drivers", assigned: false }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get restaurant location
    const { data: restaurant } = await supabase
      .from("restaurants")
      .select("lat, lng, name")
      .eq("id", order.restaurant_id)
      .single();

    const restLat = restaurant?.lat || 30.0444;
    const restLng = restaurant?.lng || 31.2357;

    // Calculate distance for each driver (Haversine)
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const haversine = (lat1: number, lng1: number, lat2: number, lng2: number) => {
      const R = 6371;
      const dLat = toRad(lat2 - lat1);
      const dLng = toRad(lng2 - lng1);
      const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    const scored = drivers.map((d) => ({
      ...d,
      distance: haversine(d.current_lat!, d.current_lng!, restLat, restLng),
      score: haversine(d.current_lat!, d.current_lng!, restLat, restLng) * 1.0
        - (d.rating || 5) * 0.5
        + (d.total_deliveries || 0) * -0.01,
    }));

    scored.sort((a, b) => a.score - b.score);
    const bestDriver = scored[0];

    // Assign driver to order
    await supabase.from("orders").update({
      driver_id: bestDriver.id,
      status: "confirmed",
    }).eq("id", order_id);

    // Set driver to busy
    await supabase.from("drivers").update({ status: "busy" }).eq("id", bestDriver.id);

    const eta = Math.round(bestDriver.distance * 5 + 15); // rough ETA in minutes

    return new Response(JSON.stringify({
      assigned: true,
      driver_id: bestDriver.id,
      driver_distance_km: Math.round(bestDriver.distance * 10) / 10,
      estimated_minutes: eta,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
