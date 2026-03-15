
-- Chat messages table for customer-driver communication
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  sender_role TEXT NOT NULL DEFAULT 'customer',
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Policy: users can read messages for their orders
CREATE POLICY "Users can read chat messages for their orders"
ON public.chat_messages FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = chat_messages.order_id
    AND (o.customer_id = auth.uid() OR o.driver_id IN (
      SELECT d.id FROM public.drivers d WHERE d.user_id = auth.uid()
    ))
  )
);

-- Policy: users can insert messages for their orders
CREATE POLICY "Users can send chat messages for their orders"
ON public.chat_messages FOR INSERT TO authenticated
WITH CHECK (
  sender_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = chat_messages.order_id
    AND (o.customer_id = auth.uid() OR o.driver_id IN (
      SELECT d.id FROM public.drivers d WHERE d.user_id = auth.uid()
    ))
  )
);

-- Enable realtime for chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
