export type Product = {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  featured: boolean;
  active: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
};

export type CartLine = {
  product: Product;
  quantity: number;
};

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
