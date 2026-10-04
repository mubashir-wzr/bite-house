import { NextResponse } from 'next/server';
import { createReservation } from '@/lib/supabase';
import { sendEmailJS } from '@/lib/emailjs';
export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name || !body.phone || !body.reservation_date || !body.reservation_time || !body.guests) return NextResponse.json({error:'Please complete the required fields.'},{status:400});
    const reservation = await createReservation({name:String(body.name).trim(),phone:String(body.phone).trim(),email:body.email?String(body.email).trim():undefined,reservation_date:String(body.reservation_date),reservation_time:String(body.reservation_time),guests:Number(body.guests),notes:body.notes?String(body.notes).trim():undefined});
    void sendEmailJS(process.env.EMAILJS_RESERVATION_TEMPLATE_ID, {
      reservation_id: reservation.id || '', name: reservation.name, phone: reservation.phone, email: reservation.email || '',
      guests: reservation.guests, date: reservation.reservation_date, time: reservation.reservation_time, note: reservation.notes || '',
      to_email: process.env.ADMIN_EMAIL || process.env.EMAILJS_ADMIN_EMAIL || '', reply_to: reservation.email || ''
    }).catch(() => undefined);
    return NextResponse.json({reservation});
  } catch(error) { return NextResponse.json({error:error instanceof Error?error.message:'Could not save reservation.'},{status:500}); }
}
