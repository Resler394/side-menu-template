export interface Category {
  id: string;
  name: string;
  slug: string;
  iconName: string; // Lucide icon key or emoji representation
  description?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  price: number; // in DZD (Algerian Dinar)
  description: string;
  image: string;
  isAvailable: boolean;
  isFeatured?: boolean;
  sortOrder: number;
  calories?: number;
  preparationTime?: string;
  tags?: string[]; // e.g. "Chef's Special", "Gluten-Free", "Vegan", "Bestseller"
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderItem {
  product: Product;
  quantity: number;
  notes?: string;
}

export interface FilterState {
  searchQuery: string;
  categoryId: string; // 'all' or specific category id
  onlyAvailable: boolean;
  onlyFeatured: boolean;
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'name-asc';
}

export interface BusinessInfo {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  whatsapp: string; // e.g. 213555123456
  currency: string; // 'DZD'
  openingHours: string;
  tableCount: number;
}
