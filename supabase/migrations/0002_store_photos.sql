create table if not exists public.store_photos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  alt text not null,
  image_url text not null,
  storage_path text,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger store_photos_set_updated_at
before update on public.store_photos
for each row execute function public.set_updated_at();

alter table public.store_photos enable row level security;

create policy "Public can read active store photos"
on public.store_photos for select
using (is_active = true or public.is_admin());

create policy "Admins can manage store photos"
on public.store_photos for all
using (public.is_admin())
with check (public.is_admin());

insert into storage.buckets (id, name, public)
values ('store-photos', 'store-photos', true)
on conflict (id) do nothing;

insert into public.store_photos (title, alt, image_url, display_order, is_active)
values
  ('Facade de la boutique', 'Facade de la boutique Service Center', '/images/facebook/profile.jpg', 10, true),
  ('Accessoires en boutique', 'Accessoires disponibles en boutique', '/images/facebook/photo-09.jpg', 20, true),
  ('Accessoires connectes', 'Bracelets et accessoires connectes', '/images/facebook/photo-06.jpg', 30, true),
  ('Horaires Service Center', 'Horaires exceptionnels Service Center', '/images/facebook/photo-08.jpg', 40, true);
