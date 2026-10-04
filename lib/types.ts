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

export type ProductOptions = {
  bun: 'Sesame' | 'Brioche';
  extra: 'None' | 'Cheese' | 'Sauce';
  extraPrice: number;
};

export type CartLine = {
  product: Product;
  quantity: number;
  key: string;
  unitPrice: number;
  options?: ProductOptions;
};

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
