import { ProductCard } from '@/components/ProductCard';
import { fallbackMenu } from '@/lib/menu';
import { getProducts } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default async function MenuPage() {
  let products = fallbackMenu;
  try {
    const dbProducts = await getProducts({ activeOnly: true });
    if (dbProducts.length) products = dbProducts;
  } catch {}

  const groups = products.reduce<Record<string, typeof products>>((acc, product) => {
    (acc[product.category] ||= []).push(product);
    return acc;
  }, {});

  return <main className="page-shell"><section className="page-hero"><div className="container"><p className="eyebrow">THE MENU</p><h1>Pick your craving.</h1><p>Everything is made to order. No filler, no boring shortcuts.</p></div></section><section className="section"><div className="container">{Object.entries(groups).map(([category, items]) => <div className="menu-group" key={category}><div className="menu-group-head"><h2>{category}</h2><span>{items.length} items</span></div><div className="product-grid">{items.map((product) => <ProductCard key={product.id} product={product} />)}</div></div>)}</div></section></main>;
}
