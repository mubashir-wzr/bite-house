import './globals.css';
import { CartProvider } from '@/components/CartProvider';

export const metadata = { title: 'Bite House — Crafted to Crave', description: 'Bite House burger restaurant — handcrafted burgers, sides, drinks and real online ordering.' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><CartProvider>{children}</CartProvider></body></html>;
}
