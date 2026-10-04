'use client';

import { useEffect, useRef } from 'react';

const TOTAL_FRAMES = 135;

export function SequenceHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const images = useRef<(HTMLImageElement | null)[]>(Array(TOTAL_FRAMES + 1).fill(null));
  const loaded = useRef(new Set<number>());
  const current = useRef(1);
  const target = useRef(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;

    const loadFrame = (n: number) => {
      if (n < 1 || n > TOTAL_FRAMES || loaded.current.has(n)) return;
      const image = new Image();
      image.decoding = 'async';
      image.src = `/burger_frames/frame_${String(n).padStart(3, '0')}.jpg`;
      image.onload = () => {
        images.current[n] = image;
        loaded.current.add(n);
        draw();
      };
    };

    const draw = () => {
      const image = images.current[Math.round(current.current)] || images.current[1];
      if (!image) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const scale = Math.max(w / image.naturalWidth, h / image.naturalHeight);
      const iw = image.naturalWidth * scale;
      const ih = image.naturalHeight * scale;
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(image, (w - iw) / 2, (h - ih) / 2, iw, ih);
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    };

    const onScroll = () => {
      const currentSection = sectionRef.current;
      if (!currentSection) return;
      const max = currentSection.offsetHeight - window.innerHeight;
      if (max <= 0) return;
      const progress = Math.max(0, Math.min(1, -currentSection.getBoundingClientRect().top / max));
      target.current = 1 + progress * (TOTAL_FRAMES - 1);
      const center = Math.round(target.current);
      for (let i = center - 6; i <= center + 10; i++) loadFrame(i);
    };

    const tick = () => {
      current.current += (target.current - current.current) * 0.15;
      draw();
      raf = requestAnimationFrame(tick);
    };

    for (let i = 1; i <= 15; i++) loadFrame(i);
    resize();
    onScroll();
    window.addEventListener('resize', resize);
    window.addEventListener('scroll', onScroll, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <section ref={sectionRef} className="sequence-hero">
      <div className="sequence-sticky">
        <canvas ref={canvasRef} aria-hidden="true" />
        <div className="hero-shade" />
        <div className="hero-copy">
          <p className="eyebrow">BITE HOUSE · PESHAWAR</p>
          <h1>Made to be remembered.</h1>
          <p>Big flavor. Crispy edges. Zero boring bites.</p>
          <a href="/menu" className="button button-light">Order the good stuff</a>
        </div>
        <div className="hero-side hero-side-left">SMASH · CRUNCH · SIP</div>
        <div className="hero-side hero-side-right">FRESH EVERY DAY</div>
        <div className="scrollHint">SCROLL TO EXPLORE <span>↓</span></div>
      </div>
    </section>
  );
}
