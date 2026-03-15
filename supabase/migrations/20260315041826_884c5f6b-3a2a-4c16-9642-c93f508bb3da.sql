
-- Allow admins to upload to restaurant-images bucket
CREATE POLICY "Admins can upload restaurant images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'restaurant-images' AND
  has_role(auth.uid(), 'admin'::app_role)
);

-- Allow admins to update restaurant images
CREATE POLICY "Admins can update restaurant images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'restaurant-images' AND
  has_role(auth.uid(), 'admin'::app_role)
);

-- Allow admins to delete restaurant images
CREATE POLICY "Admins can delete restaurant images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'restaurant-images' AND
  has_role(auth.uid(), 'admin'::app_role)
);

-- Allow anyone to view restaurant images (public bucket)
CREATE POLICY "Anyone can view restaurant images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'restaurant-images');

-- Allow admins to upload to driver-documents bucket
CREATE POLICY "Admins can upload driver documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'driver-documents' AND
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can update driver documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'driver-documents' AND
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can delete driver documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'driver-documents' AND
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can view driver documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'driver-documents' AND
  has_role(auth.uid(), 'admin'::app_role)
);
