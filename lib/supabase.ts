import type { Product } from './types';

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

function assertConfig() {
  if (!url || !serviceKey) throw new Error('Supabase is not configured. Add SUPABASE_URL and SUPABASE_SECRET_KEY (or the legacy SUPABASE_SERVICE_ROLE_KEY) to your environment.');
}

async function supabaseFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  assertConfig();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: serviceKey!,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
    cache: 'no-store',
  });
  const text = await response.text();
  let body: unknown = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  if (!response.ok) {
    const detail = typeof body === 'string' ? body : JSON.stringify(body);
    throw new Error(`Supabase request failed (${response.status}): ${detail}`);
  }
  return body as T;
}

export async function getProducts(options?: { activeOnly?: boolean; featuredOnly?: boolean }) {
  const filters: string[] = [];
  if (options?.activeOnly) filters.push('active=eq.true');
  if (options?.featuredOnly) filters.push('featured=eq.true');
  const query = ['select=*','order=sort_order.asc,name.asc', ...filters].join('&');
  return supabaseFetch<Product[]>(`products?${query}`);
}

export async function createProduct(input: Omit<Product, 'id'|'created_at'|'updated_at'>) {
  const rows = await supabaseFetch<Product[]>('products', { method:'POST', headers:{Prefer:'return=representation'}, body:JSON.stringify(input) });
  return rows[0];
}
export async function updateProduct(id:number,input:Partial<Omit<Product,'id'|'created_at'|'updated_at'>>) {
  const rows = await supabaseFetch<Product[]>(`products?id=eq.${id}`, { method:'PATCH', headers:{Prefer:'return=representation'}, body:JSON.stringify({...input,updated_at:new Date().toISOString()}) });
  return rows[0];
}
export async function deleteProduct(id:number){ await supabaseFetch<unknown>(`products?id=eq.${id}`,{method:'DELETE'}); }

export type OrderInput = {
  customer_name:string; customer_phone:string; customer_email?:string; delivery_address:string;
  items:Array<{product_id:number;name:string;quantity:number;price:number;options?:string}>;
  subtotal:number; delivery_fee:number; total:number; payment_method:string; transaction_id:string;
};
export async function createOrder(input:OrderInput){
  const orderNumber=`BH-${Date.now().toString().slice(-8)}`;
  const rows=await supabaseFetch<any[]>('orders',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify({...input,order_number:orderNumber,status:'pending'})});
  return rows[0];
}
export async function getOrders(){ return supabaseFetch<any[]>('orders?select=*&order=created_at.desc'); }
export async function updateOrderStatus(id:string,status:string){
  const rows=await supabaseFetch<any[]>(`orders?id=eq.${encodeURIComponent(id)}`,{method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify({status,updated_at:new Date().toISOString()})});
  return rows[0];
}
export async function getReservations(){ return supabaseFetch<any[]>('reservations?select=*&order=created_at.desc'); }
export async function updateReservationStatus(id:string,status:string){
  const rows=await supabaseFetch<any[]>(`reservations?id=eq.${encodeURIComponent(id)}`,{method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify({status})}); return rows[0];
}
export async function getContactMessages(){ return supabaseFetch<any[]>('contact_messages?select=*&order=created_at.desc'); }
export async function updateContactStatus(id:string,status:string){
  const rows=await supabaseFetch<any[]>(`contact_messages?id=eq.${encodeURIComponent(id)}`,{method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify({status})}); return rows[0];
}
export async function createReservation(input:{name:string;phone:string;email?:string;reservation_date:string;reservation_time:string;guests:number;notes?:string}){
  const rows=await supabaseFetch<any[]>('reservations',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify({...input,status:'pending'})}); return rows[0];
}
export async function createContact(input:{name:string;email:string;phone?:string;message:string}){
  const rows=await supabaseFetch<any[]>('contact_messages',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify({...input,status:'new'})}); return rows[0];
}
