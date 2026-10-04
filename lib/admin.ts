import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';

const COOKIE='bitehouse_admin';
function secret(){
  const value=process.env.ADMIN_SESSION_SECRET;
  if(!value) throw new Error('ADMIN_SESSION_SECRET is not configured.');
  return value;
}
export function createAdminToken(){
  const password=process.env.ADMIN_PASSWORD;
  if(!password) throw new Error('ADMIN_PASSWORD is not configured.');
  return createHmac('sha256',secret()).update(password).digest('hex');
}
export function isAdminTokenValid(token?:string){
  if(!token)return false;
  try{const expected=createAdminToken();const a=Buffer.from(token),b=Buffer.from(expected);return a.length===b.length&&timingSafeEqual(a,b);}catch{return false;}
}
export async function isAdmin(){try{const store=await cookies();return isAdminTokenValid(store.get(COOKIE)?.value);}catch{return false;}}
export function adminCookieName(){return COOKIE;}
