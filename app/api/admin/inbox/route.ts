import { NextResponse } from 'next/server';
import { getContactMessages, getReservations } from '@/lib/supabase';
import { isAdmin } from '@/lib/admin';
export async function GET(){if(!await isAdmin())return NextResponse.json({error:'Unauthorized'},{status:401});try{const [reservations,messages]=await Promise.all([getReservations(),getContactMessages()]);return NextResponse.json({reservations,messages});}catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Could not load inbox.'},{status:500});}}
