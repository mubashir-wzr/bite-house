import './globals.css';
import { CartProvider } from '@/components/CartProvider';
import { Navbar } from '@/components/Navbar';

export const metadata = {
  title: 'Bite House — Crafted to Crave',
  description: 'A modern burger restaurant experience.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <Navbar />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
