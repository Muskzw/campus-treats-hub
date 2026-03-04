
-- Admin can view all orders
CREATE POLICY "Admins can view all orders"
ON public.orders FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can update all orders
CREATE POLICY "Admins can update all orders"
ON public.orders FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can view all order_items
CREATE POLICY "Admins can view all order_items"
ON public.order_items FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can view all user_roles
CREATE POLICY "Admins can view all user_roles"
ON public.user_roles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can update user_roles
CREATE POLICY "Admins can update user_roles"
ON public.user_roles FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can insert user_roles
CREATE POLICY "Admins can insert user_roles"
ON public.user_roles FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admin can delete user_roles
CREATE POLICY "Admins can delete user_roles"
ON public.user_roles FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can update all vendors (for approval)
CREATE POLICY "Admins can update all vendors"
ON public.vendors FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Add category column to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category text DEFAULT 'general';
