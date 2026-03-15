
-- Add driver verification fields
ALTER TABLE public.drivers 
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS id_card_url text,
ADD COLUMN IF NOT EXISTS selfie_with_id_url text,
ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'pending';

-- Create storage bucket for driver documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('driver-documents', 'driver-documents', false)
ON CONFLICT (id) DO NOTHING;

-- RLS: drivers can upload their own documents
CREATE POLICY "Drivers can upload own documents"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'driver-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

-- RLS: drivers can view their own documents
CREATE POLICY "Drivers can view own documents"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'driver-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

-- RLS: admins can view all driver documents
CREATE POLICY "Admins can view all driver documents"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'driver-documents' AND public.has_role(auth.uid(), 'admin'));

-- Allow authenticated users to insert their own role
CREATE POLICY "Users can insert own role on signup"
ON public.user_roles FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());
