-- =============================================
-- 梁雞商行 Supabase 建表 SQL
-- 在 Supabase > SQL Editor 貼上全部執行
-- =============================================

-- 1. 訂單表
create table if not exists orders (
  id text primary key,
  created_at timestamptz not null,
  status text not null default 'pending',
  customer jsonb not null,
  items jsonb not null,
  payment text not null,
  shipping text not null default 'frozen',
  total integer not null
);

-- 2. 商品表
create table if not exists products (
  id text primary key,
  name text not null,
  description text not null default '',
  price integer not null,
  unit text not null default '',
  image text not null default '',
  category text not null default '',
  in_stock boolean not null default true,
  options jsonb not null default '[]',
  full_description text not null default ''
);

-- 3. 設定表（單筆，id 固定為 1）
create table if not exists settings (
  id integer primary key default 1,
  free_shipping_threshold integer not null default 2000,
  shipping_fee integer not null default 120,
  store_name text not null default '梁雞商行',
  store_phone text not null default '',
  line_official_account_id text not null default ''
);

-- 插入預設設定（若已存在則略過）
insert into settings (id, free_shipping_threshold, shipping_fee, store_name, store_phone, line_official_account_id)
values (1, 2000, 120, '梁雞商行', '', '')
on conflict (id) do nothing;

-- 4. Storage Bucket（商品圖片）
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- 5. Storage 公開讀取政策
create policy "Public read product-images"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "Authenticated upload product-images"
  on storage.objects for insert
  with check (bucket_id = 'product-images');

-- =============================================
-- 完成後請執行 scripts/seed.ts 匯入商品資料
-- npx tsx scripts/seed.ts
-- =============================================
