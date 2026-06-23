import { featuredProducts } from "@/lib/site";
import { supabase } from "@/lib/supabase";

export type Product = {
  id?: string;
  name: string;
  slug: string;
  description?: string | null;
  category: string;
  price_cents: number;
  stock_quantity: number;
  image_url?: string | null;
  is_active: boolean;
};

export type DisplayProduct = {
  id?: string;
  name: string;
  category: string;
  price: string;
  description?: string | null;
};

export function formatPrice(priceCents: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR"
  }).format(priceCents / 100);
}

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function getPublicProducts(): Promise<DisplayProduct[]> {
  if (!supabase) {
    return featuredProducts;
  }

  const { data, error } = await supabase
    .from("products")
    .select("id,name,description,category,price_cents")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(12);

  if (error || !data?.length) {
    return featuredProducts;
  }

  return data.map((product) => ({
    id: product.id,
    name: product.name,
    category: product.category,
    description: product.description,
    price: formatPrice(product.price_cents)
  }));
}
