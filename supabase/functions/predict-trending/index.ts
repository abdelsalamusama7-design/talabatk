import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableKey = Deno.env.get("LOVABLE_API_KEY")!;

    const supabase = createClient(supabaseUrl, serviceKey);

    // 1. Gather data: recent orders (last 7 days) with items
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: recentOrders } = await supabase
      .from("orders")
      .select("items, total, restaurant_id, created_at")
      .gte("created_at", sevenDaysAgo)
      .not("status", "eq", "cancelled");

    // 2. Get all menu items with restaurant info
    const { data: menuItems } = await supabase
      .from("menu_items")
      .select("id, name, description, price, image_url, category, restaurant_id, restaurants(name)")
      .eq("is_available", true);

    // 3. Build context for AI
    const orderSummary = (recentOrders || []).map((o) => {
      const items = Array.isArray(o.items) ? o.items : [];
      return items.map((i: any) => i.name).join(", ");
    }).filter(Boolean).join("; ");

    const menuSummary = (menuItems || []).slice(0, 50).map((m: any) => 
      `${m.name} (${m.price} EGP) from ${m.restaurants?.name || "unknown"} - ${m.category}`
    ).join("\n");

    const today = new Date();
    const dayName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][today.getDay()];
    const hour = today.getHours();
    const timeContext = hour < 11 ? "breakfast time" : hour < 16 ? "lunch time" : "dinner time";

    const prompt = `You are an AI food trend analyst for an Egyptian food delivery platform called "طلباتك" (Talabatk).

Today is ${dayName}, it's currently ${timeContext} in Egypt.

Recent orders (last 7 days): ${orderSummary || "No orders yet - use your knowledge of Egyptian food culture to predict trends."}

Available menu items:
${menuSummary || "No menu items registered yet - suggest popular Egyptian meals that would trend."}

Based on the day of week, time of day, Egyptian food culture, weather patterns, and ordering trends, predict the TOP 5 most popular meals for today.

Return ONLY a JSON array with exactly 5 objects, each having these fields:
- meal_name: Arabic name of the meal
- meal_description: Short Arabic description (max 50 chars)
- restaurant_name: The restaurant it's from (use real ones from menu if available, otherwise suggest fitting names)
- price: Estimated price in EGP (number)
- score: Popularity score 1-10 (number)
- reason: Short Arabic reason why it's trending (max 30 chars)

Return ONLY the JSON array, no markdown, no explanation.`;

    // 4. Call AI
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-5-mini",
        messages: [
          { role: "system", content: "You are a food trend prediction AI. Always respond with valid JSON only. No markdown formatting." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);

      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, try again later" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "";
    
    // Parse JSON from response (handle possible markdown wrapping)
    let meals: any[] = [];
    try {
      const jsonStr = content.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(jsonStr);
      meals = Array.isArray(parsed) ? parsed : parsed.meals || [];
    } catch (e) {
      console.error("Failed to parse AI response:", content);
      return new Response(JSON.stringify({ error: "Failed to parse AI response" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (meals.length === 0) {
      return new Response(JSON.stringify({ error: "No predictions generated" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 5. Clear old predictions for today and insert new ones
    const todayStr = today.toISOString().split("T")[0];
    await supabase.from("trending_meals").delete().eq("prediction_date", todayStr);

    // Try to match with real menu items
    const insertData = meals.map((m: any) => {
      const matchedItem = (menuItems || []).find(
        (mi: any) => mi.name.includes(m.meal_name) || m.meal_name.includes(mi.name)
      );
      return {
        meal_name: m.meal_name,
        meal_description: m.meal_description,
        restaurant_name: matchedItem ? (matchedItem as any).restaurants?.name : m.restaurant_name,
        restaurant_id: matchedItem?.restaurant_id || null,
        menu_item_id: matchedItem?.id || null,
        price: matchedItem?.price || m.price,
        image_url: matchedItem?.image_url || null,
        score: m.score,
        reason: m.reason,
        prediction_date: todayStr,
      };
    });

    const { error: insertError } = await supabase.from("trending_meals").insert(insertData);
    if (insertError) {
      console.error("Insert error:", insertError);
      throw new Error(insertError.message);
    }

    return new Response(JSON.stringify({ success: true, predictions: insertData }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("predict-trending error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
