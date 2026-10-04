'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useCart } from './CartProvider';
import type { Product, ProductOptions } from '@/lib/types';
import { fallbackMenu } from '@/lib/menu';

const FRAME_COUNT = 135;
const PAYMENT_NUMBER = '03349552257';
const EXTRA_PRICES = { None: 0, Cheese: 120, Sauce: 60 } as const;
const categories = ['All','Burgers','Chicken','Sides','Drinks','Dessert'];
const locations = [
  {name:'Hayatabad',city:'Peshawar',hours:'12 PM – 1 AM',icon:'📍'},
  {name:'University Road',city:'Peshawar',hours:'12 PM – 2 AM',icon:'📍'},
  {name:'F-7',city:'Islamabad',hours:'1 PM – 1 AM',icon:'📍'},
];
const emojiFor = (category: string) => ({ Burgers:'🍔', Chicken:'🍗', Sides:'🍟', Drinks:'🥤', Dessert:'🍫' } as Record<string,string>)[category] || '🍔';
const money = (n:number) => `Rs. ${Number(n||0).toLocaleString('en-PK')}`;
const tagFor = (p:Product) => p.featured ? 'Best seller' : p.category === 'Chicken' ? 'Crunchy' : p.category === 'Sides' ? 'Shareable' : p.category === 'Drinks' ? 'Cold' : p.category === 'Dessert' ? 'Sweet' : 'House pick';

type PendingSuccess = { orderNumber:string; reference:string; email:string } | null;

export function HomeExperience(){
  const { items, addItem, setQuantity, removeItem, clearCart, subtotal, count } = useCart();
  const [products,setProducts]=useState<Product[]>(fallbackMenu as Product[]);
  const [category,setCategory]=useState('All');
  const [cartOpen,setCartOpen]=useState(false);
  const [productModal,setProductModal]=useState<Product|null>(null);
  const [checkoutOpen,setCheckoutOpen]=useState(false);
  const [success,setSuccess]=useState<PendingSuccess>(null);
  const [qty,setQty]=useState(1);
  const [bun,setBun]=useState<ProductOptions['bun']>('Sesame');
  const [extra,setExtra]=useState<ProductOptions['extra']>('None');
  const [form,setForm]=useState({name:'',phone:'',email:'',address:'',city:'Peshawar'});
  const [reference,setReference]=useState('');
  const [paymentReady,setPaymentReady]=useState(false);
  const [reservation,setReservation]=useState({name:'',phone:'',email:'',guests:'2',date:'',time:'',note:''});
  const [contact,setContact]=useState({name:'',email:'',message:''});
  const [reservationStatus,setReservationStatus]=useState('');
  const [contactStatus,setContactStatus]=useState('');
  const [checkoutStatus,setCheckoutStatus]=useState('');
  const [loadingProducts,setLoadingProducts]=useState(true);

  // Hero: native scroll -> frame target; safe refs prevent the null-reference crash from the previous build.
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const sceneRef=useRef<HTMLElement>(null);
  const progressRef=useRef<HTMLDivElement>(null);
  const cueRef=useRef<HTMLDivElement>(null);
  const loaderRef=useRef<HTMLDivElement>(null);
  const currentFrame=useRef(1); const targetFrame=useRef(1); const images=useRef<(HTMLImageElement|null)[]>(Array(FRAME_COUNT+1).fill(null)); const loaded=useRef<Uint8Array>(new Uint8Array(FRAME_COUNT+1)); const lastValid=useRef(1); const raf=useRef(0);

  useEffect(()=>{
    const canvas=canvasRef.current, scene=sceneRef.current;
    if(!canvas||!scene)return;
    const ctx=canvas.getContext('2d',{alpha:false,desynchronized:true}); if(!ctx)return;
    let cancelled=false;
    const frameUrl=(n:number)=>`/burger_frames/frame_${String(n).padStart(3,'0')}.jpg`;
    const draw=(index:number,force=false)=>{
      const img=images.current[index];
      if(!img||!loaded.current[index]||!img.naturalWidth||!img.naturalHeight)return false;
      if(!force&&index===currentFrame.current)return true;
      const cw=canvas.width,ch=canvas.height,scale=Math.max(cw/img.naturalWidth,ch/img.naturalHeight),dw=img.naturalWidth*scale,dh=img.naturalHeight*scale;
      ctx.fillStyle='#120d08';ctx.fillRect(0,0,cw,ch);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(img,(cw-dw)*.5,(ch-dh)*.5,dw,dh);currentFrame.current=index;lastValid.current=index;return true;
    };
    const nearest=(wanted:number)=>{if(loaded.current[wanted])return wanted;for(let d=1;d<FRAME_COUNT;d++){const a=wanted-d,b=wanted+d;if(a>=1&&loaded.current[a])return a;if(b<=FRAME_COUNT&&loaded.current[b])return b;}return lastValid.current;};
    const resize=()=>{const rect=canvas.getBoundingClientRect();const dpr=Math.min(window.devicePixelRatio||1,2);const w=Math.max(1,Math.round(rect.width*dpr)),h=Math.max(1,Math.round(rect.height*dpr));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;if(loaded.current[lastValid.current])draw(lastValid.current,true);}};
    const preload=(n:number)=>{if(n<1||n>FRAME_COUNT||images.current[n])return;const img=new Image();img.decoding='async';images.current[n]=img;img.onload=()=>{if(cancelled)return;loaded.current[n]=1;if(n===1){resize();draw(1,true);if(loaderRef.current){loaderRef.current.textContent='Scroll to reveal';window.setTimeout(()=>loaderRef.current?.classList.add('hide'),700);}}if(Math.abs(n-targetFrame.current)<2)schedule();};img.onerror=()=>{images.current[n]=null;};img.src=frameUrl(n);};
    const preloadNear=(center:number)=>{for(let i=0;i<=12;i++){preload(center+i);preload(center-i);}};
    const render=()=>{raf.current=0;const diff=targetFrame.current-currentFrame.current;if(Math.abs(diff)>.05){const eased=currentFrame.current+diff*.22;draw(nearest(Math.max(1,Math.min(FRAME_COUNT,Math.round(eased)))));raf.current=requestAnimationFrame(render);}};
    const schedule=()=>{if(!raf.current)raf.current=requestAnimationFrame(render);};
    const onScroll=()=>{const currentScene=sceneRef.current;if(!currentScene)return;const max=Math.max(1,currentScene.offsetHeight-window.innerHeight);const top=currentScene.getBoundingClientRect().top;const progress=Math.max(0,Math.min(1,-top/max));targetFrame.current=1+progress*(FRAME_COUNT-1);if(progressRef.current)progressRef.current.style.width=`${(progress*100).toFixed(2)}%`;if(cueRef.current)cueRef.current.style.opacity=String(Math.max(0,1-progress*5));schedule();preloadNear(Math.round(targetFrame.current));};
    const onResize=()=>window.setTimeout(()=>{resize();onScroll();},80);
    resize();preload(1);preloadNear(1);
    let batch=2; const loadBatch=()=>{for(let i=batch;i<=Math.min(FRAME_COUNT,batch+12);i++)preload(i);batch+=13;if(batch<=FRAME_COUNT)window.setTimeout(loadBatch,90);};window.setTimeout(loadBatch,120);
    window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('resize',onResize,{passive:true});onScroll();schedule();
    return()=>{cancelled=true;cancelAnimationFrame(raf.current);window.removeEventListener('scroll',onScroll);window.removeEventListener('resize',onResize);};
  },[]);

  useEffect(()=>{(async()=>{try{const r=await fetch('/api/products',{cache:'no-store'});if(r.ok){const d=await r.json();if(Array.isArray(d.products)&&d.products.length)setProducts(d.products);} }catch{} finally{setLoadingProducts(false);}})();},[]);

  useEffect(()=>{document.body.classList.toggle('locked',cartOpen||!!productModal||checkoutOpen||!!success);return()=>document.body.classList.remove('locked');},[cartOpen,productModal,checkoutOpen,success]);

  const visibleProducts=useMemo(()=>category==='All'?products:products.filter(p=>p.category===category),[products,category]);
  const delivery=subtotal>=1500||subtotal===0?0:150;
  const total=subtotal+delivery;

  const profileSave=()=>{try{localStorage.setItem('bite-house-profile',JSON.stringify(form));}catch{}};
  const loadProfile=()=>{try{const p=JSON.parse(localStorage.getItem('bite-house-profile')||'{}');setForm((f)=>({...f,...p}));}catch{}};
  const addCustomized=()=>{if(!productModal)return;addItem(productModal,{bun,extra,extraPrice:EXTRA_PRICES[extra]});setProductModal(null);setQty(1);setBun('Sesame');setExtra('None');setCartOpen(true);};
  const openCheckout=()=>{if(!items.length)return;loadProfile();setCheckoutStatus('');setReference('');setPaymentReady(false);setCartOpen(false);setCheckoutOpen(true);};

  const submitCheckout=async(e:FormEvent)=>{e.preventDefault();if(!form.name.trim()||!form.phone.trim()||!form.email.trim()||!form.address.trim()||!form.city.trim()){setCheckoutStatus('Please complete all delivery fields.');return;}profileSave();setPaymentReady(true);setCheckoutStatus('Details saved. Complete the Easypaisa transfer shown on the right, then enter the reference ID.');};
  const confirmOrder=async()=>{if(reference.trim().length<4){setCheckoutStatus('Please enter your Easypaisa transaction/reference ID.');return;}setCheckoutStatus('Saving order…');try{const r=await fetch('/api/orders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({customer_name:form.name,customer_phone:form.phone,customer_email:form.email,delivery_address:`${form.address}, ${form.city}`,transaction_id:reference.trim(),items:items.map((x)=>({product_id:x.product.id,quantity:x.quantity,bun:x.options?.bun||'Sesame',extra:x.options?.extra||'None'}))})});const d=await r.json();if(!r.ok)throw new Error(d.error||'Could not place order.');setSuccess({orderNumber:d.order.order_number,reference:reference.trim(),email:form.email});clearCart();setCheckoutOpen(false);}catch(err){setCheckoutStatus(err instanceof Error?err.message:'Could not place order.');}};

  const submitReservation=async(e:FormEvent)=>{e.preventDefault();setReservationStatus('Sending request…');try{const r=await fetch('/api/reservations',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:reservation.name,phone:reservation.phone,email:reservation.email,reservation_date:reservation.date,reservation_time:reservation.time,guests:Number(reservation.guests),notes:reservation.note})});const d=await r.json();if(!r.ok)throw new Error(d.error||'Could not save reservation.');setReservationStatus('Reservation request sent.');setReservation({name:'',phone:'',email:'',guests:'2',date:'',time:'',note:''});}catch(err){setReservationStatus(err instanceof Error?err.message:'Could not save reservation.');}};
  const submitContact=async(e:FormEvent)=>{e.preventDefault();setContactStatus('Sending…');try{const r=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(contact)});const d=await r.json();if(!r.ok)throw new Error(d.error||'Could not send message.');setContactStatus('Message sent.');setContact({name:'',email:'',message:''});}catch(err){setContactStatus(err instanceof Error?err.message:'Could not send message.');}};

  return <>
    <section ref={sceneRef} className="scroll-scene" id="home">
      <div className="sticky-stage">
        <canvas ref={canvasRef} className="hero-canvas" aria-label="Bite House burger animation" />
        <div className="hero-shade" />
        <nav className="hero-nav" aria-label="Main navigation">
          <Link className="brand glass" href="#home" aria-label="Bite House home"><span className="brand-mark" />BITE HOUSE</Link>
          <div className="nav-center">
            <a className="nav-chip" href="#menu">MENU</a><a className="nav-chip" href="#story">STORY</a><a className="nav-chip" href="#locations">LOCATIONS</a><a className="nav-chip" href="#reserve">RESERVE</a><a className="nav-chip" href="#contact">CONTACT</a>
          </div>
          <button className="cart-btn" onClick={()=>setCartOpen(true)} type="button">CART <span className="cart-count">{count}</span></button>
        </nav>
        <div className="hero-side left">B<b>I</b>TE HOUSE</div><div className="hero-side right">B<b>I</b>TE HOUSE</div>
        <div ref={cueRef} className="scroll-cue"><span />Scroll to reveal<span /></div>
        <div className="hero-progress" aria-hidden="true"><span>01</span><div className="progress-track"><div ref={progressRef} className="progress-fill" /></div><span>135</span></div>
        <div ref={loaderRef} className="hero-loader glass">Loading first bite…</div>
      </div>
    </section>

    <section className="feature-strip"><div className="shell feature-grid">
      <div className="feature"><strong>Fresh every day</strong><span>Proper ingredients and crisp produce.</span></div>
      <div className="feature"><strong>Fast delivery</strong><span>Hot, packed and on the way.</span></div>
      <div className="feature"><strong>Made your way</strong><span>Choose bun, cheese and extras.</span></div>
      <div className="feature"><strong>Late-night cravings</strong><span>Open late on selected locations.</span></div>
    </div></section>

    <section className="section menu-section" id="menu"><div className="shell">
      <div className="section-head"><div className="copy"><div className="eyebrow">The menu</div><h2 className="display">Big flavor.<br/>Zero boring bites.</h2><p className="lead">Signature burgers built with toasted buns, juicy patties and sauces made to disappear from the plate.</p></div><button className="btn btn-dark" type="button" onClick={()=>setCartOpen(true)}>View your cart</button></div>
      <div className="menu-tabs">{categories.map((c)=><button key={c} className={`tab ${c===category?'active':''}`} type="button" onClick={()=>setCategory(c)}>{c}</button>)}</div>
      <div className="menu-grid">{loadingProducts && <div className="soft-card" style={{padding:24}}>Loading menu…</div>}{!loadingProducts && visibleProducts.length===0 && <div className="soft-card" style={{padding:24}}>No items in this category yet.</div>}{visibleProducts.map((item)=><article className="menu-card soft-card" key={item.id}><div className="food-photo">{item.image_url?<img src={item.image_url} alt={item.name}/>:<div className="food-fallback">{emojiFor(item.category)}</div>}</div><div className="food-content"><div className="item-row"><div><div style={{fontSize:10,fontWeight:900,letterSpacing:'.12em',textTransform:'uppercase',color:'var(--orange)'}}>{tagFor(item)}</div><h3>{item.name}</h3></div><div className="price">{money(item.price)}</div></div><p className="item-desc">{item.description}</p><div className="item-actions"><button className="btn btn-ghost" type="button" onClick={()=>{setProductModal(item);setQty(1);setBun('Sesame');setExtra('None');}}>Customize</button><button className="btn btn-primary" type="button" onClick={()=>{addItem(item);setCartOpen(true);}}>Add</button></div></div></article>)}</div>
    </div></section>

    <section className="section story-section" id="story"><div className="shell story-grid"><div className="story-copy soft-card"><div className="eyebrow">Our story</div><h2 className="display">Built around<br/>the good stuff.</h2><p>We started with one simple idea: make the kind of burger people talk about on the ride home. Every order is built when it is placed.</p><div className="story-points"><div className="story-point"><strong>01 · Ingredients</strong><span>Fresh produce, signature sauces and proper cheese.</span></div><div className="story-point"><strong>02 · Craft</strong><span>Smash, sear, stack, repeat — no shortcuts.</span></div><div className="story-point"><strong>03 · Vibe</strong><span>Casual for a quick bite, special for a night out.</span></div><div className="story-point"><strong>04 · People</strong><span>Made by a crew that genuinely loves burgers.</span></div></div></div><div className="story-image soft-card"><div className="story-plate">🍔</div></div></div></section>

    <section className="section reserve-section" id="reserve"><div className="shell reserve-card"><div><div className="eyebrow" style={{color:'#ffbb7a'}}>Book a table</div><h2 className="display">Make it a<br/>burger night.</h2><p className="lead">Bring the crew. Pick the table. We’ll handle the cravings.</p></div><div className="reserve-panel"><form onSubmit={submitReservation}><div className="form-grid"><div className="field"><label htmlFor="resName">Name</label><input id="resName" required value={reservation.name} onChange={e=>setReservation({...reservation,name:e.target.value})} placeholder="Your name"/></div><div className="field"><label htmlFor="resPhone">Phone</label><input id="resPhone" required value={reservation.phone} onChange={e=>setReservation({...reservation,phone:e.target.value})} placeholder="03xx xxxxxxx"/></div><div className="field"><label htmlFor="resEmail">Email</label><input id="resEmail" type="email" value={reservation.email} onChange={e=>setReservation({...reservation,email:e.target.value})} placeholder="you@example.com"/></div><div className="field"><label htmlFor="resGuests">Guests</label><select id="resGuests" value={reservation.guests} onChange={e=>setReservation({...reservation,guests:e.target.value})}>{['2','3','4','5','6+'].map(g=><option key={g}>{g}</option>)}</select></div><div className="field"><label htmlFor="resDate">Date</label><input id="resDate" type="date" required value={reservation.date} onChange={e=>setReservation({...reservation,date:e.target.value})}/></div><div className="field"><label htmlFor="resTime">Time</label><input id="resTime" type="time" required value={reservation.time} onChange={e=>setReservation({...reservation,time:e.target.value})}/></div><div className="field full"><label htmlFor="resNote">Note</label><textarea id="resNote" value={reservation.note} onChange={e=>setReservation({...reservation,note:e.target.value})} placeholder="Birthday, window seat, anything we should know?"/></div></div><button className="btn btn-primary btn-full" style={{marginTop:14}} type="submit">Request reservation</button>{reservationStatus&&<p className="tiny-note">{reservationStatus}</p>}</form></div></div></section>

    <section className="section locations-section" id="locations"><div className="shell"><div className="section-head"><div className="copy"><div className="eyebrow">Find us</div><h2 className="display">A table near<br/>your cravings.</h2><p className="lead">Pick a Bite House spot, check the hours and come hungry.</p></div></div><div className="location-grid">{locations.map(x=><article className="location-card soft-card" key={x.name}><div className="location-icon">{x.icon}</div><h3>{x.name}</h3><p>{x.city}. Walk in for a quick Bite House or make a reservation before the rush.</p><div className="location-meta">{x.hours} · Dine in / Takeaway</div></article>)}</div></div></section>

    <section className="section contact-section" id="contact"><div className="shell contact-grid"><div className="contact-panel soft-card"><div className="eyebrow">Talk to us</div><h2 className="display">Questions?<br/>We’re listening.</h2><div className="contact-list"><div className="contact-item"><span>📞</span><div><b>Order line</b><a href="tel:+923349552257"><span>+92 334 955 2257</span></a></div></div><div className="contact-item"><span>✉️</span><div><b>Email</b><span>Email notifications can be sent through EmailJS.</span></div></div><div className="contact-item"><span>⏱</span><div><b>Hours</b><span>12:00 PM — 1:00 AM</span></div></div></div></div><div className="contact-panel soft-card"><div className="eyebrow">Contact form</div><h3 style={{fontSize:28,margin:'12px 0 20px'}}>Drop us a message.</h3><form className="contact-form" onSubmit={submitContact}><div className="form-grid"><div className="field"><label htmlFor="cName">Name</label><input id="cName" required value={contact.name} onChange={e=>setContact({...contact,name:e.target.value})} placeholder="Your name"/></div><div className="field"><label htmlFor="cEmail">Email</label><input id="cEmail" type="email" required value={contact.email} onChange={e=>setContact({...contact,email:e.target.value})} placeholder="you@example.com"/></div><div className="field full"><label htmlFor="cMessage">Message</label><textarea id="cMessage" required value={contact.message} onChange={e=>setContact({...contact,message:e.target.value})} placeholder="Tell us what’s up..."/></div></div><button className="btn btn-dark" type="submit" style={{marginTop:14}}>Send message</button>{contactStatus&&<p className="form-status" style={{marginTop:10}}>{contactStatus}</p>}</form></div></div></section>

    <footer className="footer"><div className="shell footer-inner"><Link className="brand" href="#home"><span className="brand-mark"/>BITE HOUSE</Link><small>© 2026 Bite House · Crafted for hungry people. · <Link href="/admin">Admin</Link></small></div></footer>

    {cartOpen && <><div className="overlay open" onClick={()=>setCartOpen(false)}/><aside className="cart-drawer open"><div className="drawer-head"><h2>Your order</h2><button className="close" onClick={()=>setCartOpen(false)} aria-label="Close cart">×</button></div><div className="cart-body">{!items.length?<div className="empty-cart"><div style={{fontSize:44}}>🍔</div><h3 style={{margin:'12px 0 5px'}}>Your cart is hungry.</h3><div>Add something delicious from the menu.</div></div>:items.map((line)=><div className="cart-line" key={line.key}><div className="cart-thumb">{line.product.image_url?<img src={line.product.image_url} alt=""/>:emojiFor(line.product.category)}</div><div><h4>{line.product.name}</h4><p>{line.options?`${line.options.bun} bun · ${line.options.extra}`:'Classic build'}</p><div className="qty"><button onClick={()=>setQuantity(line.key,line.quantity-1)} type="button">−</button><span>{line.quantity}</span><button onClick={()=>setQuantity(line.key,line.quantity+1)} type="button">+</button></div></div><strong>{money(line.unitPrice*line.quantity)}</strong></div>)}</div>{!!items.length && <div className="cart-bottom"><div className="sum-row"><span>Subtotal</span><strong>{money(subtotal)}</strong></div><div className="sum-row"><span>Delivery</span><strong>{delivery?money(delivery):'FREE'}</strong></div><div className="sum-row total"><span>Total</span><strong>{money(total)}</strong></div><button className="btn btn-primary btn-full" type="button" onClick={openCheckout}>Continue to Easypaisa checkout</button><div className="fine" style={{marginTop:8}}>Manual Easypaisa payment to <strong>{PAYMENT_NUMBER}</strong>. PIN and OTP are never requested here.</div></div>}</aside></>}

    {productModal && <div className="modal-wrap open"><div className="modal"><div className="modal-head"><h3>Customize your order</h3><button className="close" onClick={()=>setProductModal(null)}>×</button></div><div className="modal-body"><div className="detail-grid"><div className="detail-image">{productModal.image_url?<img src={productModal.image_url} alt={productModal.name}/>:emojiFor(productModal.category)}</div><div className="detail-info"><h4>{productModal.name}</h4><p>{productModal.description}</p><div className="price">{money(productModal.price+EXTRA_PRICES[extra])}</div><div className="option-group"><span>Bun</span><div className="option-row">{(['Sesame','Brioche'] as const).map(v=><button key={v} className={`option ${bun===v?'selected':''}`} type="button" onClick={()=>setBun(v)}>{v}</button>)}</div></div><div className="option-group"><span>Extra</span><div className="option-row">{(['None','Cheese','Sauce'] as const).map(v=><button key={v} className={`option ${extra===v?'selected':''}`} type="button" onClick={()=>setExtra(v)}>{v}{v==='Cheese'?' +120':v==='Sauce'?' +60':''}</button>)}</div></div><div style={{display:'flex',gap:8,alignItems:'center',marginTop:22}}><button className="btn btn-ghost" type="button" onClick={()=>setQty(Math.max(1,qty-1))}>−</button><strong>{qty}</strong><button className="btn btn-ghost" type="button" onClick={()=>setQty(qty+1)}>+</button><button className="btn btn-primary" type="button" onClick={()=>{for(let i=0;i<qty;i++)addItem(productModal,{bun,extra,extraPrice:EXTRA_PRICES[extra]});setProductModal(null);setQty(1);setCartOpen(true);}} style={{marginLeft:'auto'}}>Add to cart</button></div></div></div></div></div></div>}

    {checkoutOpen && <div className="modal-wrap open"><div className="modal checkout-modal-shell"><div className="modal-head"><h3>Checkout</h3><button className="close" onClick={()=>setCheckoutOpen(false)}>×</button></div><div className="checkout-layout"><section className="checkout-side"><div className="checkout-step"><span className="step-dot">1</span> Delivery details <span className="step-line"/><span>2</span> Payment</div><div className="eyebrow">Ready to order</div><h4>Your table or your door.</h4><p className="lead">Your details are saved on this device, so the next Bite House order is faster.</p><div className="checkout-summary-card"><div className="eyebrow" style={{color:'var(--muted)',marginBottom:10}}>Your basket</div><div className="checkout-summary-list">{items.map(x=><div className="checkout-item-line" key={x.key}><span>{x.quantity} × {x.product.name}<small style={{display:'block',color:'var(--muted)',fontSize:9,marginTop:2}}>{x.options?`${x.options.bun} bun · ${x.options.extra}`:'Classic build'}</small></span><span>{money(x.unitPrice*x.quantity)}</span></div>)}</div><div className="checkout-divider">Total</div><div className="sum-row"><span>Subtotal</span><strong>{money(subtotal)}</strong></div><div className="sum-row"><span>Delivery</span><strong>{delivery?money(delivery):'FREE'}</strong></div><div className="sum-row total"><span>Total</span><strong>{money(total)}</strong></div></div><form onSubmit={submitCheckout}><div className="checkout-form-grid"><div className="field"><label htmlFor="oName">Name</label><input id="oName" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required placeholder="Your name"/></div><div className="field"><label htmlFor="oPhone">Phone</label><input id="oPhone" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} required placeholder="03xx xxxxxxx"/></div><div className="field full"><label htmlFor="oEmail">Receipt email</label><input id="oEmail" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required placeholder="you@example.com"/></div><div className="field full"><label htmlFor="oAddress">Delivery address</label><input id="oAddress" value={form.address} onChange={e=>setForm({...form,address:e.target.value})} required placeholder="House, street, area"/></div><div className="field full"><label htmlFor="oCity">City</label><input id="oCity" value={form.city} onChange={e=>setForm({...form,city:e.target.value})} required/></div></div><button className="btn btn-dark btn-full" type="submit">{paymentReady?'Update delivery details':'Continue to Easypaisa'}</button><p className="tiny-note">Payment instructions are shown inside the phone screen. This page never asks for an Easypaisa PIN, OTP, or password.</p></form>{paymentReady&&<div style={{marginTop:10}}><button className="btn btn-primary btn-full" type="button" onClick={confirmOrder}>Confirm payment & place order</button></div>}{checkoutStatus&&<p className="tiny-note">{checkoutStatus}</p>}</section><section className="phone-area"><div className="phone-device"><div className="phone-screen"><div className="phone-bar"><span>BITE HOUSE CHECKOUT</span><span className="signal"><i/><i/><i/> 100%</span></div><div className="ep-head"><div className="ep-brand">easypaisa<small>payment flow</small></div><div className="ep-icon">EP</div></div><div className="ep-card"><div className="ep-kicker">Pay merchant</div><div className="ep-merchant">Bite House</div><p className="ep-total">{money(total)}</p><div className="ep-caption">Exact amount for this order</div><div className="ep-recipient"><div className="ep-kicker">Send to this number</div><div className="ep-recipient-row"><strong className="ep-number">{PAYMENT_NUMBER}</strong><button className="ep-copy" type="button" onClick={async()=>{try{await navigator.clipboard.writeText(PAYMENT_NUMBER);}catch{} }}>Copy</button></div></div><div className="ep-steps"><div className="ep-step"><b>1</b><span>Open your Easypaisa app and choose the transfer/send option.</span></div><div className="ep-step"><b>2</b><span>Send the exact total shown above to the Bite House merchant number.</span></div><div className="ep-step"><b>3</b><span>Return here and enter the transaction/reference ID.</span></div></div><div className="ep-divider"/><label className="ep-kicker" htmlFor="paymentReference">Transaction/reference ID</label><input id="paymentReference" className="ep-input" value={reference} onChange={e=>setReference(e.target.value)} autoComplete="off" maxLength={80} placeholder="e.g. EP123456789"/><button className="ep-pay" type="button" disabled={!paymentReady||reference.trim().length<4} onClick={confirmOrder}>I’ve sent the payment</button><div className="ep-status">{paymentReady?'Enter your reference ID, then confirm the order.':'Complete delivery details first.'}</div></div><p className="ep-safe"><strong>Bite House payment screen.</strong> This is not the official Easypaisa app. Never enter an Easypaisa PIN or OTP here.</p><a href="https://easypaisa.com.pk/" target="_blank" rel="noopener" className="btn btn-ghost btn-full" style={{marginTop:12,textAlign:'center'}}>Open Easypaisa</a></div></div></section></div></div></div>}

    {success && <div className="modal-wrap open"><div className="modal"><div className="modal-body" style={{textAlign:'center',padding:'46px 24px'}}><div style={{fontSize:56}}>🍔</div><div className="eyebrow">Order received</div><h3 style={{fontSize:38,letterSpacing:'-.04em',margin:'10px 0'}}>The kitchen can see it.</h3><div className="order-status-pill"><span className="order-status-dot"/>Pending payment verification</div><p style={{color:'var(--muted)',lineHeight:1.7,maxWidth:560,margin:'16px auto 8px'}}>Order <strong>{success.orderNumber}</strong> has been saved. Your Easypaisa reference is <strong>{success.reference}</strong>.</p><p style={{fontSize:12,color:'var(--muted)',margin:'0 auto 20px'}}>A confirmation can be sent to {success.email} when EmailJS is configured.</p><button className="btn btn-dark" type="button" onClick={()=>setSuccess(null)}>Done</button></div></div></div>}
  </>;
}
