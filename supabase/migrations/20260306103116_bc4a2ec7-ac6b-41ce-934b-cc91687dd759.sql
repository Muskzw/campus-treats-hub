CREATE POLICY "Vendors can view order items for their orders"
ON public.order_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM orders
    JOIN vendors ON vendors.id = orders.vendor_id
    WHERE orders.id = order_items.order_id
    AND vendors.user_id = auth.uid()
  )
);