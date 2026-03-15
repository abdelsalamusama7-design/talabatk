
-- Promo codes table
CREATE TABLE public.promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  discount_type text NOT NULL DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value numeric NOT NULL DEFAULT 0,
  min_order numeric DEFAULT 0,
  max_uses integer DEFAULT NULL,
  used_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  expires_at timestamptz DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active promos" ON public.promo_codes FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage promos" ON public.promo_codes FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Enable realtime for drivers table (for location updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.drivers;
