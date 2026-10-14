import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('your-project')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const SUPABASE_SQL_SETUP = `
-- ========================================================
-- Velvet Rose Pâtisserie & Café Lounge - Supabase Schema
-- Run this in your Supabase SQL Editor:
-- ========================================================

-- 1. Create Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon_name TEXT NOT NULL DEFAULT 'Cake',
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Products Table
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  description TEXT,
  image TEXT NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  calories INTEGER,
  preparation_time TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Row Level Security (RLS)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all users (Menu view)
CREATE POLICY "Allow public read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Allow public read products" ON public.products FOR SELECT USING (true);

-- Allow authenticated users / service role full write access
CREATE POLICY "Allow authenticated insert categories" ON public.categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated update categories" ON public.categories FOR UPDATE USING (true);
CREATE POLICY "Allow authenticated delete categories" ON public.categories FOR DELETE USING (true);

CREATE POLICY "Allow authenticated insert products" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated update products" ON public.products FOR UPDATE USING (true);
CREATE POLICY "Allow authenticated delete products" ON public.products FOR DELETE USING (true);

-- 4. Storage Bucket for Images (optional)
-- Insert a public bucket for menu uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('menu-assets', 'menu-assets', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow public select on menu-assets" ON storage.objects FOR SELECT USING (bucket_id = 'menu-assets');
CREATE POLICY "Allow authenticated upload on menu-assets" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'menu-assets');
`;
