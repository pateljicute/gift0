-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT
);

-- 2. Products Table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    sale_price DECIMAL(10,2),
    stock INTEGER DEFAULT 0,
    images TEXT[] DEFAULT '{}',
    is_featured BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    specifications JSONB DEFAULT '{}'::jsonb,
    -- Phase 7: Advanced Delivery Logic
    delivery_charge NUMERIC(10, 2) DEFAULT 40.00,
    weight NUMERIC(10, 2), -- in kg
    dimensions JSONB -- { height, width, length } in cm
);

-- Enable Row Level Security (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- create policies (Drop first to avoid errors if they exist)
DROP POLICY IF EXISTS "Enable read access for all users" ON categories;
CREATE POLICY "Enable read access for all users" ON categories
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON products;
CREATE POLICY "Enable read access for all users" ON products
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable write access for authenticated users" ON categories;
CREATE POLICY "Enable write access for authenticated users" ON categories
    FOR ALL USING (auth.jwt() ->> 'email' = 'sushilpatel7489@gmail.com');

DROP POLICY IF EXISTS "Enable write access for authenticated users" ON products;
CREATE POLICY "Enable write access for authenticated users" ON products
    FOR ALL USING (auth.jwt() ->> 'email' = 'sushilpatel7489@gmail.com');

-- Insert Initial Data (Categories)
INSERT INTO categories (name, slug, description, image_url) VALUES
('Frames', 'frames', 'Beautiful photo frames', 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48'),
('Gift Items', 'gift-items', 'Special gifts for every occasion', 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a'),
('Cakes', 'cakes', 'Delicious cakes for all celebrations', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587')
ON CONFLICT (slug) DO NOTHING;

-- Insert Initial Data (Sample Products) - REMOVED AS PER USER REQUEST

-- 3. Product Likes Table (Fix for missing relationship error)
CREATE TABLE IF NOT EXISTS product_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE(user_id, product_id)
);

-- RLS for product_likes
ALTER TABLE product_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON product_likes;
CREATE POLICY "Enable read access for all users" ON product_likes
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON product_likes;
CREATE POLICY "Enable insert for authenticated users" ON product_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON product_likes;
CREATE POLICY "Enable delete for users based on user_id" ON product_likes
    FOR DELETE USING (auth.uid() = user_id);

-- 4. Profiles Table (Fix for AuthProvider error)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    house_no TEXT,
    street TEXT,
    city TEXT,
    state TEXT,
    zip TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- 5. Gift Tiers Table (Fix for CartContext error)
CREATE TABLE IF NOT EXISTS gift_tiers (
    id SERIAL PRIMARY KEY,
    threshold_amount DECIMAL(10,2) NOT NULL,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    images TEXT[],
    is_featured BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    specifications JSONB, -- For category-specific details
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE gift_tiers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON gift_tiers;
CREATE POLICY "Enable read access for all users" ON gift_tiers
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable write access for authenticated users" ON gift_tiers;
CREATE POLICY "Enable write access for authenticated users" ON gift_tiers
    FOR ALL USING (auth.jwt() ->> 'email' = 'sushilpatel7489@gmail.com');

-- 6. Orders Table (Fix for 404 error)
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_address TEXT NOT NULL,
    product_id UUID REFERENCES products(id), -- Nullable for multi-item (cart) orders if changed later, but 'single' for now based on inferred usage
    quantity INTEGER DEFAULT 1,
    total_price DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    gift_name TEXT,
    gift_image_url TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL -- Optional link to user
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for users based on user_id" ON orders;
CREATE POLICY "Enable read access for users based on user_id" ON orders
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Enable insert for all users" ON orders;
CREATE POLICY "Enable insert for all users" ON orders
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for admin only" ON orders;
CREATE POLICY "Enable update for admin only" ON orders
    FOR UPDATE USING (auth.jwt() ->> 'email' = 'sushilpatel7489@gmail.com');
