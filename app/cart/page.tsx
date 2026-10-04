'use client';

import Link from 'next/link';
import { useCart } from '@/components/CartProvider';

export default function CartPage() {
  const { items, subtotal, setQuantity, removeItem } = useCart();
  const delivery = items.length ? 120 : 0;
  const total = subtotal + delivery;

  return <main className="page-shell"><section className="page-hero"><div className="container"><p className="eyebrow">YOUR ORDER</p><h1>Your cart.</h1></div></section><section className="section"><div className="container cart-layout">{!items.length ? <div className="empty-state"><h2>Nothing here yet.</h2><p>Add something properly delicious from the menu.</p><Link href="/menu" className="button">Browse menu</Link></div> : <><div className="cart-lines">{items.map((line) => <div className="cart-line" key={line.product.id}><div className="cart-line-image">{line.product.image_url ? <img src={line.product.image_url} alt="" /> : '🍔'}</div><div className="cart-line-main"><h3>{line.product.name}</h3><p>Rs {line.product.price.toLocaleString()}</p><div className="qty"><button onClick={() => setQuantity(line.product.id, line.quantity - 1)} type="button">−</button><span>{line.quantity}</span><button onClick={() => setQuantity(line.product.id, line.quantity + 1)} type="button">+</button></div></div><div className="cart-line-end"><strong>Rs {(line.product.price * line.quantity).toLocaleString()}</strong><button className="remove-btn" onClick={() => removeItem(line.product.id)} type="button">Remove</button></div></div>)}</div><aside className="order-summary"><p className="eyebrow">SUMMARY</p><h2>Checkout</h2><div className="summary-row"><span>Subtotal</span><span>Rs {subtotal.toLocaleString()}</span></div><div className="summary-row"><span>Delivery</span><span>Rs {delivery.toLocaleString()}</span></div><div className="summary-row total"><span>Total</span><strong>Rs {total.toLocaleString()}</strong></div><Link className="button button-full" href="/checkout">Continue to checkout</Link></aside></>}</div></section></main>;
}
