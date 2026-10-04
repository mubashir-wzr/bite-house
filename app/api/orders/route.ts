import { NextResponse } from 'next/server';
import { createOrder, getProducts, sendEmailViaResend } from '@/lib/supabase';
export const dynamic = 'force-dynamic';

export async function POST(request: Request){
  try{
    const body=await request.json();
    if(!body.customer_name||!body.customer_phone||!body.delivery_address||!Array.isArray(body.items)||!body.items.length||!body.transaction_id){
      return NextResponse.json({error:'Please complete your name, phone, address, items and transaction ID.'},{status:400});
    }

    const products=await getProducts({activeOnly:true});
    const cleanItems=body.items.map((item:any)=>{
      const product=products.find((p)=>p.id===Number(item.product_id));
      const quantity=Math.max(1,Math.min(20,Number(item.quantity)||0));
      if(!product||quantity<1) throw new Error('One of the selected products is no longer available.');
      return {product_id:product.id,name:product.name,quantity,price:product.price};
    });
    const subtotal=cleanItems.reduce((sum:number,item:any)=>sum+item.price*item.quantity,0);
    const delivery_fee=120;
    const total=subtotal+delivery_fee;

    const order=await createOrder({
      customer_name:String(body.customer_name).trim(),
      customer_phone:String(body.customer_phone).trim(),
      customer_email:body.customer_email?String(body.customer_email).trim():undefined,
      delivery_address:String(body.delivery_address).trim(),
      items:cleanItems,subtotal,delivery_fee,total,
      payment_method:'easypaisa',
      transaction_id:String(body.transaction_id).trim(),
    });

    const adminEmail=process.env.ADMIN_EMAIL;
    if(adminEmail){void sendEmailViaResend({to:adminEmail,subject:`New Bite House order ${order.order_number}`,html:`<h2>New order ${order.order_number}</h2><p><strong>${order.customer_name}</strong> · ${order.customer_phone}</p><p>Total: Rs ${order.total}</p><p>Transaction ID: ${order.transaction_id}</p><p>Address: ${order.delivery_address}</p>`}).catch(()=>{});}
    if(body.customer_email){void sendEmailViaResend({to:String(body.customer_email),subject:`Bite House order ${order.order_number}`,html:`<h2>We got it.</h2><p>Your Bite House order <strong>${order.order_number}</strong> has been received.</p><p>Total: Rs ${order.total}</p>`}).catch(()=>{});}
    return NextResponse.json({order});
  }catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Could not place order.'},{status:500});}
}
