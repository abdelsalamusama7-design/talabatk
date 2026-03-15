
-- Allow authenticated users to upload review images
CREATE POLICY "Authenticated users can upload review images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'review-images');

-- Allow public read of review images
CREATE POLICY "Public can read review images"
ON storage.objects FOR SELECT
USING (bucket_id = 'review-images');

-- RLS for loyalty_points
ALTER TABLE public.loyalty_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own loyalty points"
ON public.loyalty_points FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own loyalty points"
ON public.loyalty_points FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- RLS for reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read reviews"
ON public.reviews FOR SELECT
USING (true);

CREATE POLICY "Users can insert own reviews"
ON public.reviews FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());
