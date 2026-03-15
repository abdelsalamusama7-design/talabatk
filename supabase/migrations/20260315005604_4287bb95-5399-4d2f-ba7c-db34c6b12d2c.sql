
-- Trending meals cache table (populated by AI predictions)
CREATE TABLE public.trending_meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_name TEXT NOT NULL,
  meal_description TEXT,
  restaurant_name TEXT,
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE SET NULL,
  menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE SET NULL,
  price NUMERIC(10,2),
  image_url TEXT,
  score NUMERIC(5,2) DEFAULT 0,
  reason TEXT,
  prediction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.trending_meals ENABLE ROW LEVEL SECURITY;

-- Anyone can read trending meals (public data)
CREATE POLICY "Anyone can view trending meals" ON public.trending_meals FOR SELECT USING (true);

-- Only service role / edge functions insert (no user insert)
-- We use a permissive policy that checks for admin role for manual inserts
CREATE POLICY "Admins can manage trending meals" ON public.trending_meals FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_trending_meals_date ON public.trending_meals(prediction_date);
