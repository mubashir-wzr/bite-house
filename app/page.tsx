import Link from 'next/link';
import { SequenceHero } from '@/components/SequenceHero';
import { ProductCard } from '@/components/ProductCard';
import { fallbackMenu } from '@/lib/menu';
import { getProducts } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default async function Home() {
  let featured = fallbackMenu.filter((p) => p.featured);
  try {
    const dbProducts = await getProducts({ activeOnly: true, featuredOnly: true });
    if (dbProducts.length) featured = dbProducts;
  } catch {}

  return (
    <main>
      <SequenceHero />

      <section className="section section-dark intro-section">
        <div className="container split-heading">
          <div>
            <p className="eyebrow">THE BITE HOUSE DIFFERENCE</p>
            <h2>Fast food energy. Restaurant-level obsession.</h2>
          </div>
          <p className="section-lead">We smash fresh, season hard, stack high and keep the menu focused on food people actually come back for.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-topline">
            <div><p className="eyebrow">FEATURED</p><h2>House favorites.</h2></div>
            <Link href="/menu" className="text-link">See full menu →</Link>
          </div>
          <div className="product-grid">{featured.slice(0, 4).map((product) => <ProductCard key={product.id} product={product} />)}</div>
        </div>
      </section>

      <section className="section story-section">
        <div className="container story-card">
          <div>
            <p className="eyebrow">BUILT AROUND THE CRAVE</p>
            <h2>A local burger spot with a big-city attitude.</h2>
            <p>From the first smash to the last sip, every detail is there to make a simple meal feel like your favorite meal.</p>
            <Link href="/about" className="button">Meet Bite House</Link>
          </div>
          <div className="story-stat"><span>01</span><strong>Fresh every day.</strong><small>Simple ingredients, proper technique.</small></div>
          <div className="story-stat"><span>02</span><strong>Built to order.</strong><small>Hot, crispy and stacked when you want it.</small></div>
          <div className="story-stat"><span>03</span><strong>Made to return to.</strong><small>Because one visit should never be enough.</small></div>
        </div>
      </section>

      <section className="section cta-section">
        <div className="container cta-card">
          <div><p className="eyebrow">YOUR TABLE IS WAITING</p><h2>Ready for a serious bite?</h2></div>
          <div className="cta-actions"><Link href="/menu" className="button button-light">Order now</Link><Link href="/reservations" className="button button-ghost">Book a table</Link></div>
        </div>
      </section>

      <footer className="footer"><div className="container footer-inner"><div><strong className="brand">BITE<span>HOUSE</span></strong><p>Crafted to crave.</p></div><div className="footer-links"><Link href="/menu">Menu</Link><Link href="/about">About</Link><Link href="/contact">Contact</Link><Link href="/admin">Admin</Link></div></div></footer>
    </main>
  );
}
