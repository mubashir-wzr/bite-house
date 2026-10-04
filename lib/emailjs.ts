type Params = Record<string, string | number | undefined>;

export async function sendEmailJS(templateId: string | undefined, templateParams: Params) {
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;
  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;
  if (!publicKey || !serviceId || !templateId) return false;

  const payload: Record<string, unknown> = {
    service_id: serviceId,
    template_id: templateId,
    user_id: publicKey,
    template_params: templateParams,
  };
  if (privateKey) payload.accessToken = privateKey;

  const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`EmailJS failed (${response.status})`);
  return true;
}

export async function sendOrderNotifications(order: any) {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAILJS_ADMIN_EMAIL;
  const items = (order.items || []).map((x:any) => `${x.quantity} × ${x.name} — Rs ${Number(x.price * x.quantity).toLocaleString('en-PK')}${x.options ? ` · ${x.options}` : ''}`).join('\n');
  const base = {
    order_number: order.order_number, customer_name: order.customer_name, customer_email: order.customer_email || '',
    customer_phone: order.customer_phone, address: order.delivery_address, items,
    subtotal: `Rs ${Number(order.subtotal).toLocaleString('en-PK')}`,
    delivery: order.delivery_fee ? `Rs ${Number(order.delivery_fee).toLocaleString('en-PK')}` : 'FREE',
    total: `Rs ${Number(order.total).toLocaleString('en-PK')}`, payment_method: order.payment_method,
    payment_reference: order.transaction_id || '', merchant_number: '03349552257', order_status: order.status,
    reply_to: order.customer_email || '', to_email: adminEmail || '',
  };
  let sent = false;
  if (adminEmail) sent = await sendEmailJS(process.env.EMAILJS_ORDER_ADMIN_TEMPLATE_ID, base) || sent;
  if (order.customer_email && process.env.EMAILJS_ORDER_CUSTOMER_TEMPLATE_ID) {
    if (sent) await new Promise((r) => setTimeout(r, 1100));
    sent = await sendEmailJS(process.env.EMAILJS_ORDER_CUSTOMER_TEMPLATE_ID, {...base, to_email: order.customer_email}) || sent;
  }
  return sent;
}
