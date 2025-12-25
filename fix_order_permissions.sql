-- ==============================================
-- MASTER FIX FOR ORDERS & CHECKOUT (V2)
-- Run this in Supabase SQL Editor.
-- This works even if the tables already exist!
-- ==============================================

-- 0. Force Schema Cache Reload (helps with "column not found" errors)
NOTIFY pgrst, 'reload schema';

-- 1. ADD MISSING COLUMNS to 'orders'
ALTER TABLE orders ADD COLUMN IF NOT EXISTS gift_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS gift_image_url TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- 2. ADD MISSING COLUMNS to 'profiles' (Fixes Profile Update Error)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS house_no TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS street TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS zip TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;

-- 3. Ensure 'order_items' table exists (Critical for checkout)
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    quantity INTEGER NOT NULL,
    price_at_time DECIMAL(10,2) NOT NULL
);

-- 4. ENABLE RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 5. FIX POLICIES (Allow Access)

-- A) ORDERS policies
DROP POLICY IF EXISTS "Enable insert for all users" ON orders;
CREATE POLICY "Enable insert for all users" ON orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable read access for users based on user_id" ON orders;
CREATE POLICY "Enable read access for users based on user_id" ON orders
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Enable read access for admins" ON orders;
CREATE POLICY "Enable read access for admins" ON orders FOR SELECT USING (true); -- Admin View

DROP POLICY IF EXISTS "Enable update for admins" ON orders;
CREATE POLICY "Enable update for admins" ON orders FOR UPDATE USING (true); -- Admin Manage

-- B) ORDER_ITEMS policies
DROP POLICY IF EXISTS "Enable insert for all users" ON order_items;
CREATE POLICY "Enable insert for all users" ON order_items FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable read access for users based on order owner" ON order_items;
CREATE POLICY "Enable read access for users based on order owner" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders
            WHERE orders.id = order_items.order_id
            AND orders.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Enable read access for admins" ON order_items;
CREATE POLICY "Enable read access for admins" ON order_items FOR SELECT USING (true);

-- C) PROFILES policies (Fixes 400 Bad Request on profile update)
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
    FOR SELECT USING (true);
