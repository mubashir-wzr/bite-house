import { NextResponse } from 'next/server';
import { getOrders, updateOrderStatus } from '@/lib/supabase';
import { isAdmin } from '@/lib/admin';
export async function GET(){if(!await isAdmin())return NextResponse.json({error:'Unauthorized'},{status:401});try{return NextResponse.json({orders:await getOrders()});}catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Could not load orders.'},{status:500});}}
export async function PATCH(request:Request){if(!await isAdmin())return NextResponse.json({error:'Unauthorized'},{status:401});try{const {id,status}=await request.json();return NextResponse.json({order:await updateOrderStatus(id,status)});}catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Could not update order.'},{status:500});}}
