import { NextResponse } from 'next/server';
import { getProducts } from '@/lib/supabase';
export const dynamic = 'force-dynamic';
export async function GET(){try{return NextResponse.json({products:await getProducts({activeOnly:true})});}catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Could not load products.'},{status:500});}}
