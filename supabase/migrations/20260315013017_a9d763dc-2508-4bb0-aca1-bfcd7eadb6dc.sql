
-- Allow inserting own driver record
CREATE POLICY "Users can insert own driver record"
ON public.drivers FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- Allow reading own driver record
CREATE POLICY "Users can read own driver"
ON public.drivers FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- Allow updating own driver record
CREATE POLICY "Users can update own driver"
ON public.drivers FOR UPDATE TO authenticated
USING (user_id = auth.uid());
