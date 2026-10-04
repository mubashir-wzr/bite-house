import { NextResponse } from 'next/server';
import { createOrder, getProducts } from '@/lib/supabase';
import { sendOrderNotifications } from '@/lib/emailjs';

export const dynamic = 'force-dynamic';

const extraPrices: Record<string, number> = { None: 0, Cheese: 120, Sauce: 60 };

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.customer_name || !body.customer_phone || !body.delivery_address || !Array.isArray(body.items) || !body.items.length || !body.transaction_id) {
      return NextResponse.json({ error: 'Please complete your name, phone, address, items and transaction ID.' }, { status: 400 });
    }
    const products = await getProducts({ activeOnly: true });
    const cleanItems = body.items.map((item: any) => {
      const product = products.find((p) => p.id === Number(item.product_id));
      const quantity = Math.max(1, Math.min(20, Number(item.quantity) || 0));
      const extra = typeof item.extra === 'string' && item.extra in extraPrices ? item.extra : 'None';
      if (!product || quantity < 1) throw new Error('One of the selected products is no longer available.');
      const price = product.price + extraPrices[extra];
      const bun = item.bun === 'Brioche' ? 'Brioche' : 'Sesame';
      return { product_id: product.id, name: product.name, quantity, price, options: `${bun} bun · ${extra}` };
    });
    const subtotal = cleanItems.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
    const delivery_fee = subtotal >= 1500 ? 0 : 150;
    const total = subtotal + delivery_fee;
    const order = await createOrder({
      customer_name: String(body.customer_name).trim(), customer_phone: String(body.customer_phone).trim(),
      customer_email: body.customer_email ? String(body.customer_email).trim() : undefined,
      delivery_address: String(body.delivery_address).trim(), items: cleanItems, subtotal, delivery_fee, total,
      payment_method: 'easypaisa', transaction_id: String(body.transaction_id).trim(),
    });
    void sendOrderNotifications(order).catch(() => undefined);
    return NextResponse.json({ order });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not place order.' }, { status: 500 });
  }
}
