import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type Order = {
  name: string;
  phone: string;
  transactionId: string;
  items: unknown[];
  total: number;
  createdAt: string;
};

const orders: Order[] = [];

export async function POST(req: Request) {
  const order = await req.json() as Order;
  if (!order.name || !order.phone || !order.transactionId || !order.items?.length) {
    return NextResponse.json({ error: "Missing order details" }, { status: 400 });
  }
  orders.push(order);
  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ orders });
}
