import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';

const COOKIE = 'bitehouse_admin';

function secret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || 'change-me';
}

export function createAdminToken() {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) throw new Error('ADMIN_PASSWORD is not configured.');
  return createHmac('sha256', secret()).update(password).digest('hex');
}

export function isAdminTokenValid(token?: string) {
  if (!token) return false;
  const expected = createAdminToken();
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function isAdmin() {
  try {
    const store = await cookies();
    return isAdminTokenValid(store.get(COOKIE)?.value);
  } catch {
    return false;
  }
}

export function adminCookieName() {
  return COOKIE;
}
