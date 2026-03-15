
CREATE TABLE public.offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text,
  discount text NOT NULL,
  bg_color text NOT NULL DEFAULT 'blue',
  icon text NOT NULL DEFAULT 'gift',
  badge text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

-- Anyone can view active offers
CREATE POLICY "Anyone can view active offers"
ON public.offers FOR SELECT
USING (is_active = true);

-- Admins can do everything
CREATE POLICY "Admins can manage offers"
ON public.offers FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Insert default offers
INSERT INTO public.offers (title, subtitle, discount, bg_color, icon, badge, sort_order) VALUES
('خصم على أول طلب', 'سجّل الآن واحصل على خصم فوري', '25%', 'blue', 'gift', 'جديد', 1),
('توصيل مجاني', 'على الطلبات فوق 100 جنيه', 'مجاني', 'green', 'zap', NULL, 2),
('عرض الغداء', 'من 12 ظهراً لـ 4 عصراً يومياً', '15%', 'orange', 'clock', 'يومي', 3),
('اطلب 3 وادفع 2', 'على وجبات مختارة من مطاعمنا', '3=2', 'purple', 'flame', '🔥 حصري', 4);
