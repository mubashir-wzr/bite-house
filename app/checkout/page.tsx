'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/components/CartProvider';

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const delivery = items.length ? 120 : 0;
  const total = subtotal + delivery;
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', transactionId: '' });
  const [status, setStatus] = useState('');
  const [orderNumber, setOrderNumber] = useState('');

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!items.length) return;
    setStatus('Placing your order…');
    const response = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customer_name: form.name, customer_phone: form.phone, customer_email: form.email, delivery_address: form.address, items: items.map(({ product, quantity }) => ({ product_id: product.id, name: product.name, quantity, price: product.price })), subtotal, delivery_fee: delivery, total, payment_method: 'easypaisa', transaction_id: form.transactionId }) });
    const data = await response.json();
    if (!response.ok) { setStatus(data.error || 'Could not place order.'); return; }
    setOrderNumber(data.order.order_number); setStatus('Order confirmed!'); clearCart();
  };

  if (orderNumber) return <main className="page-shell"><section className="section confirmation"><div className="container"><span className="success-mark">✓</span><p className="eyebrow">ORDER RECEIVED</p><h1>Thanks. We’ve got it.</h1><p>Your order <strong>{orderNumber}</strong> is now in the queue. We’ll use your phone number if we need to reach you.</p><Link href="/" className="button">Back to Bite House</Link></div></section></main>;
  if (!items.length) return <main className="page-shell"><section className="section"><div className="container empty-state"><h1>Your cart is empty.</h1><Link href="/menu" className="button">Go to menu</Link></div></section></main>;

  return <main className="page-shell"><section className="page-hero"><div className="container"><p className="eyebrow">CHECKOUT</p><h1>Let’s get that order moving.</h1></div></section><section className="section"><div className="container checkout-layout"><form className="form-card" onSubmit={submit}><label>Name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label><label>Phone<input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="03XXXXXXXXX" /></label><label>Email <span>(optional)</span><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label><label>Delivery address<textarea required rows={4} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></label><div className="payment-box"><p className="eyebrow">EASYPAISA</p><strong>Send payment to 03349552257</strong><span>Then enter the transaction ID below. Never share your PIN or OTP here.</span><input required value={form.transactionId} onChange={(e) => setForm({ ...form, transactionId: e.target.value })} placeholder="Transaction ID" /></div><button className="button button-full" type="submit">Place order · Rs {total.toLocaleString()}</button>{status && <p className="form-status">{status}</p>}</form><aside className="order-summary"><p className="eyebrow">ORDER TOTAL</p><h2>Rs {total.toLocaleString()}</h2><div className="summary-row"><span>Food</span><span>Rs {subtotal.toLocaleString()}</span></div><div className="summary-row"><span>Delivery</span><span>Rs {delivery.toLocaleString()}</span></div><div className="mini-note">Your payment is recorded with the order so it can be checked from the admin dashboard.</div></aside></div></section></main>;
}
