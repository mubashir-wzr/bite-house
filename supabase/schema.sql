create extension if not exists pgcrypto;

create table if not exists public.products (
  id bigint generated always as identity primary key,
  name text not null,
  slug text not null unique,
  description text not null default '',
  price integer not null check (price >= 0),
  category text not null default 'Burgers',
  image_url text not null default '',
  featured boolean not null default false,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  delivery_address text not null,
  items jsonb not null default '[]'::jsonb,
  subtotal integer not null,
  delivery_fee integer not null default 0,
  total integer not null,
  payment_method text not null default 'easypaisa',
  transaction_id text,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text,
  reservation_date date not null,
  reservation_time time not null,
  guests integer not null check (guests > 0),
  notes text,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  message text not null,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.reservations enable row level security;
alter table public.contact_messages enable row level security;

insert into public.products (name,slug,description,price,category,image_url,featured,active,sort_order) values
('Classic YUMMY','classic-yummy','Smash patty, cheddar, shredded lettuce, pickles and house sauce.',690,'Burgers','https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80',true,true,1),
('Firehouse','firehouse','Double smash, melted cheese, crispy onions and a smoky hot sauce.',820,'Burgers','https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=80',true,true,2),
('Crispy Chicken','crispy-chicken','Crunchy chicken, slaw, cheese and creamy pepper mayo.',760,'Chicken','https://images.unsplash.com/photo-1606756790138-261d2b21cd75?auto=format&fit=crop&w=1200&q=80',true,true,3),
('Loaded Fries','loaded-fries','Crispy fries covered in cheese sauce, jalapeño and Bite House dust.',390,'Sides','https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=1200&q=80',false,true,4),
('Golden Rings','golden-rings','Crispy onion rings with a side of signature dip.',320,'Sides','https://images.unsplash.com/photo-1639024471283-03518883512d?auto=format&fit=crop&w=1200&q=80',false,true,5),
('Salted Caramel Shake','salted-caramel-shake','Cold vanilla shake, salted caramel and a tiny sea-salt finish.',480,'Drinks','https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=1200&q=80',true,true,6),
('Cold Cola','cold-cola','Ice-cold fizz served just the way a burger deserves.',190,'Drinks','',false,true,7),
('Warm Brownie','warm-brownie','Fudgy chocolate brownie with vanilla cream.',420,'Dessert','',false,true,8)
on conflict (slug) do nothing;
