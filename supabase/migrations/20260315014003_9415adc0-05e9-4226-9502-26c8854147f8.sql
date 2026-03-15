
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS expires_at timestamptz DEFAULT NULL;
