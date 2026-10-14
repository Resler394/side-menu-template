'use client';

import { Category, Product, BusinessInfo } from '@/types/menu';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_BUSINESS_INFO } from './initial-data';
import { supabase, isSupabaseConfigured } from './supabase';

const STORAGE_KEYS = {
  CATEGORIES: 'velvet_rose_categories_v1',
  PRODUCTS: 'velvet_rose_products_v1',
  BUSINESS_INFO: 'velvet_rose_business_v1',
  ADMIN_SESSION: 'velvet_rose_admin_session_v1',
};

export function formatDZD(amount: number): string {
  return `${amount.toLocaleString('fr-DZ')} DZD`;
}

// Memory cache for SSR hydration consistency
let cachedCategories: Category[] | null = null;
let cachedProducts: Product[] | null = null;
let cachedBusinessInfo: BusinessInfo | null = null;

// Helpers to read from localStorage safely in browser
export function getLocalCategories(): Category[] {
  if (typeof window === 'undefined') return INITIAL_CATEGORIES;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.error('Error reading local categories', err);
  }
  return INITIAL_CATEGORIES;
}

export function getLocalProducts(): Product[] {
  if (typeof window === 'undefined') return INITIAL_PRODUCTS;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.error('Error reading local products', err);
  }
  return INITIAL_PRODUCTS;
}

export function getLocalBusinessInfo(): BusinessInfo {
  if (typeof window === 'undefined') return INITIAL_BUSINESS_INFO;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.BUSINESS_INFO);
    if (data) return JSON.parse(data);
  } catch (err) {
    console.error('Error reading local business info', err);
  }
  return INITIAL_BUSINESS_INFO;
}

export function saveLocalCategories(categories: Category[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    window.dispatchEvent(new Event('menu_store_updated'));
  } catch (err) {
    console.error('Error saving local categories', err);
  }
}

export function saveLocalProducts(products: Product[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    window.dispatchEvent(new Event('menu_store_updated'));
  } catch (err) {
    console.error('Error saving local products', err);
  }
}

export function saveLocalBusinessInfo(info: BusinessInfo) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.BUSINESS_INFO, JSON.stringify(info));
    window.dispatchEvent(new Event('menu_store_updated'));
  } catch (err) {
    console.error('Error saving local business info', err);
  }
}

export async function fetchCategories(): Promise<Category[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (!error && data && data.length > 0) {
        const mapped: Category[] = data.map((row: Record<string, unknown>) => ({
          id: String(row.id),
          name: String(row.name),
          slug: String(row.slug),
          iconName: String(row.icon_name || 'Cake'),
          description: row.description ? String(row.description) : undefined,
          sortOrder: Number(row.sort_order ?? 0),
          isActive: Boolean(row.is_active ?? true),
        }));
        saveLocalCategories(mapped);
        return mapped;
      }
    } catch (err) {
      console.warn('Supabase fetchCategories failed, using local store', err);
    }
  }
  return getLocalCategories();
}

export async function fetchProducts(): Promise<Product[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('sort_order', { ascending: true });

      if (!error && data && data.length > 0) {
        const mapped: Product[] = data.map((row: Record<string, unknown>) => ({
          id: String(row.id),
          categoryId: String(row.category_id),
          name: String(row.name),
          price: Number(row.price),
          description: String(row.description || ''),
          image: String(row.image || ''),
          isAvailable: Boolean(row.is_available ?? true),
          isFeatured: Boolean(row.is_featured ?? false),
          sortOrder: Number(row.sort_order ?? 0),
          calories: row.calories ? Number(row.calories) : undefined,
          preparationTime: row.preparation_time ? String(row.preparation_time) : undefined,
          tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
          createdAt: row.created_at ? String(row.created_at) : undefined,
          updatedAt: row.updated_at ? String(row.updated_at) : undefined,
        }));
        saveLocalProducts(mapped);
        return mapped;
      }
    } catch (err) {
      console.warn('Supabase fetchProducts failed, using local store', err);
    }
  }
  return getLocalProducts();
}

// Product CRUD Operations
export async function createProduct(product: Omit<Product, 'id'>): Promise<Product> {
  const newProduct: Product = {
    ...product,
    id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const current = getLocalProducts();
  const updated = [...current, newProduct];
  saveLocalProducts(updated);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('products').insert({
        id: newProduct.id,
        category_id: newProduct.categoryId,
        name: newProduct.name,
        price: newProduct.price,
        description: newProduct.description,
        image: newProduct.image,
        is_available: newProduct.isAvailable,
        is_featured: newProduct.isFeatured || false,
        sort_order: newProduct.sortOrder,
        calories: newProduct.calories,
        preparation_time: newProduct.preparationTime,
        tags: newProduct.tags || [],
      });
    } catch (err) {
      console.warn('Supabase createProduct sync error', err);
    }
  }

  return newProduct;
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
  const current = getLocalProducts();
  const index = current.findIndex((p) => p.id === id);
  if (index === -1) return null;

  const updatedProduct: Product = {
    ...current[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  const updatedList = [...current];
  updatedList[index] = updatedProduct;
  saveLocalProducts(updatedList);

  if (isSupabaseConfigured && supabase) {
    try {
      const payload: Record<string, unknown> = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.categoryId !== undefined) payload.category_id = updates.categoryId;
      if (updates.price !== undefined) payload.price = updates.price;
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.image !== undefined) payload.image = updates.image;
      if (updates.isAvailable !== undefined) payload.is_available = updates.isAvailable;
      if (updates.isFeatured !== undefined) payload.is_featured = updates.isFeatured;
      if (updates.sortOrder !== undefined) payload.sort_order = updates.sortOrder;
      if (updates.calories !== undefined) payload.calories = updates.calories;
      if (updates.preparationTime !== undefined) payload.preparation_time = updates.preparationTime;
      if (updates.tags !== undefined) payload.tags = updates.tags;
      payload.updated_at = new Date().toISOString();

      await supabase.from('products').update(payload).eq('id', id);
    } catch (err) {
      console.warn('Supabase updateProduct sync error', err);
    }
  }

  return updatedProduct;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const current = getLocalProducts();
  const updated = current.filter((p) => p.id !== id);
  saveLocalProducts(updated);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('products').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase deleteProduct sync error', err);
    }
  }

  return true;
}

// Category CRUD Operations
export async function createCategory(cat: Omit<Category, 'id'>): Promise<Category> {
  const newCat: Category = {
    ...cat,
    id: `cat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
  };

  const current = getLocalCategories();
  const updated = [...current, newCat];
  saveLocalCategories(updated);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('categories').insert({
        id: newCat.id,
        name: newCat.name,
        slug: newCat.slug,
        icon_name: newCat.iconName,
        description: newCat.description || '',
        sort_order: newCat.sortOrder,
        is_active: newCat.isActive,
      });
    } catch (err) {
      console.warn('Supabase createCategory sync error', err);
    }
  }

  return newCat;
}

export async function updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
  const current = getLocalCategories();
  const index = current.findIndex((c) => c.id === id);
  if (index === -1) return null;

  const updatedCat: Category = {
    ...current[index],
    ...updates,
  };

  const updatedList = [...current];
  updatedList[index] = updatedCat;
  saveLocalCategories(updatedList);

  if (isSupabaseConfigured && supabase) {
    try {
      const payload: Record<string, unknown> = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.slug !== undefined) payload.slug = updates.slug;
      if (updates.iconName !== undefined) payload.icon_name = updates.iconName;
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.sortOrder !== undefined) payload.sort_order = updates.sortOrder;
      if (updates.isActive !== undefined) payload.is_active = updates.isActive;

      await supabase.from('categories').update(payload).eq('id', id);
    } catch (err) {
      console.warn('Supabase updateCategory sync error', err);
    }
  }

  return updatedCat;
}

export async function deleteCategory(id: string): Promise<boolean> {
  const current = getLocalCategories();
  const updated = current.filter((c) => c.id !== id);
  saveLocalCategories(updated);

  // Also remove or reassign products from deleted category
  const prods = getLocalProducts().filter((p) => p.categoryId !== id);
  saveLocalProducts(prods);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('categories').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase deleteCategory sync error', err);
    }
  }

  return true;
}

export function resetToDefaults() {
  saveLocalCategories(INITIAL_CATEGORIES);
  saveLocalProducts(INITIAL_PRODUCTS);
  saveLocalBusinessInfo(INITIAL_BUSINESS_INFO);
}
