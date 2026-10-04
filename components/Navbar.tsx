'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from './CartProvider';

const links = [
  ['Menu', '/menu'],
  ['About', '/about'],
  ['Reservations', '/reservations'],
  ['Contact', '/contact'],
] as const;

export function Navbar() {
  const pathname = usePathname();
  const { count } = useCart();

  return (
    <header className="navbar-wrap">
      <nav className="navbar">
        <Link href="/" className="brand">BITE<span>HOUSE</span></Link>
        <div className="nav-links">
          {links.map(([label, href]) => (
            <Link key={href} href={href} className={pathname.startsWith(href) ? 'active' : ''}>{label}</Link>
          ))}
        </div>
        <Link href="/cart" className="cart-pill">Cart <span>{count}</span></Link>
      </nav>
    </header>
  );
}
