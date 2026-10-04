import { NextResponse } from 'next/server';
import { createContact } from '@/lib/supabase';
import { sendEmailJS } from '@/lib/emailjs';
export async function POST(request: Request) {
  try {
    const body = await request.json();
    if(!body.name || !body.email || !body.message) return NextResponse.json({error:'Please complete name, email and message.'},{status:400});
    const message = await createContact({name:String(body.name).trim(),email:String(body.email).trim(),phone:body.phone?String(body.phone).trim():undefined,message:String(body.message).trim()});
    void sendEmailJS(process.env.EMAILJS_CONTACT_TEMPLATE_ID, {
      name: message.name, email: message.email, phone: message.phone || '', message: message.message,
      to_email: process.env.ADMIN_EMAIL || process.env.EMAILJS_ADMIN_EMAIL || '', reply_to: message.email
    }).catch(() => undefined);
    return NextResponse.json({message});
  } catch(error) { return NextResponse.json({error:error instanceof Error?error.message:'Could not save message.'},{status:500}); }
}
