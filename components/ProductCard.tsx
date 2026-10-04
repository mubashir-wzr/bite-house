'use client';

import { useState } from 'react';
import { useCart } from './CartProvider';
import type { Product } from '@/lib/types';

const emojiFor = (category: string) => ({ Burgers:'🍔', Chicken:'🍗', Sides:'🍟', Drinks:'🥤', Dessert:'🍫' } as Record<string,string>)[category] || '🍔';

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const handleAdd = () => { addItem(product); setAdded(true); window.setTimeout(() => setAdded(false), 900); };
  return <article className="product-card">
    <div className="product-image-wrap">
      {product.image_url ? <img src={product.image_url} alt={product.name} className="product-image" /> : <div className="product-image-fallback">{emojiFor(product.category)}</div>}
      <span className="category-tag">{product.category}</span>
    </div>
    <div className="product-card-body">
      <div><h3>{product.name}</h3><p>{product.description}</p></div>
      <div className="product-bottom"><strong>Rs {product.price.toLocaleString()}</strong><button onClick={handleAdd} className="add-btn" type="button">{added ? 'Added ✓' : 'Add +'}</button></div>
    </div>
  </article>;
}
