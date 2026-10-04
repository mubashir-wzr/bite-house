'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { CartLine, Product } from '@/lib/types';

type CartContextValue = {
  items: CartLine[];
  addItem: (product: Product) => void;
  removeItem: (id: number) => void;
  setQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  count: number;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = 'bite-house-cart';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setItems(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  const value = useMemo<CartContextValue>(() => {
    const addItem = (product: Product) => {
      setItems((current) => {
        const found = current.find((line) => line.product.id === product.id);
        if (found) {
          return current.map((line) =>
            line.product.id === product.id ? { ...line, quantity: line.quantity + 1 } : line,
          );
        }
        return [...current, { product, quantity: 1 }];
      });
    };

    const removeItem = (id: number) => setItems((current) => current.filter((line) => line.product.id !== id));
    const setQuantity = (id: number, quantity: number) => {
      if (quantity <= 0) return removeItem(id);
      setItems((current) => current.map((line) => (line.product.id === id ? { ...line, quantity } : line)));
    };

    const subtotal = items.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
    const count = items.reduce((sum, line) => sum + line.quantity, 0);

    return { items, addItem, removeItem, setQuantity, clearCart: () => setItems([]), subtotal, count };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error('useCart must be used inside CartProvider');
  return value;
}
