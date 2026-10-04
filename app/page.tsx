import Link from 'next/link';import {SequenceHero} from '@/components/SequenceHero';
export default function Home(){return <><SequenceHero/><section className="intro"><p className="eyebrow">BITE HOUSE</p><h1>Crafted to crave.</h1><p>Big flavor, smashed fresh, served with attitude.</p><Link className="button" href="/menu/">Explore the menu</Link></section></>}
