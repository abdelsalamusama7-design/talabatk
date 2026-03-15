
-- Allow admins to delete drivers
CREATE POLICY "Admins can delete drivers"
ON public.drivers
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to manage (insert/update/delete) drivers
CREATE POLICY "Admins can insert drivers"
ON public.drivers
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update drivers"
ON public.drivers
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete restaurants
CREATE POLICY "Admins can delete restaurants"
ON public.restaurants
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to insert restaurants
CREATE POLICY "Admins can insert restaurants"
ON public.restaurants
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
