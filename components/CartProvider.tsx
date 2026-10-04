'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { CartLine, Product, ProductOptions } from '@/lib/types';

type CartContextValue = {
  items: CartLine[];
  addItem: (product: Product, options?: ProductOptions) => void;
  removeItem: (key: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  count: number;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = 'bite-house-cart';

function normalizeSaved(value: unknown): CartLine[] {
  if (!Array.isArray(value)) return [];
  return value.map((line: any) => {
    const product = line?.product;
    const options = line?.options;
    const unitPrice = Number(line?.unitPrice ?? product?.price ?? 0);
    const key = String(line?.key ?? product?.id ?? '');
    return {
      product,
      quantity: Math.max(1, Number(line?.quantity) || 1),
      key,
      unitPrice,
      options,
    };
  }).filter((line) => line.product && line.key);
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setItems(normalizeSaved(JSON.parse(saved)));
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch {}
  }, [items]);

  const value = useMemo<CartContextValue>(() => {
    const addItem = (product: Product, options?: ProductOptions) => {
      const extraPrice = options?.extraPrice ?? 0;
      const key = `${product.id}|${options?.bun ?? 'Sesame'}|${options?.extra ?? 'None'}`;
      setItems((current) => {
        const found = current.find((line) => line.key === key);
        if (found) return current.map((line) => line.key === key ? { ...line, quantity: Math.min(20, line.quantity + 1) } : line);
        return [...current, { product, quantity: 1, key, unitPrice: product.price + extraPrice, options }];
      });
    };
    const removeItem = (key: string) => setItems((current) => current.filter((line) => line.key !== key));
    const setQuantity = (key: string, quantity: number) => {
      if (quantity <= 0) return removeItem(key);
      setItems((current) => current.map((line) => line.key === key ? { ...line, quantity: Math.min(20, quantity) } : line));
    };
    const subtotal = items.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
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
