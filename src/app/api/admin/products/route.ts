import { NextResponse } from "next/server";
import { isAdminSessionValid } from "@/lib/admin/auth";
import { isSupabaseAdminConfigured, supabaseAdmin } from "@/lib/admin/supabase-admin";
import { supabase } from "@/lib/supabase";
import { slugify } from "@/lib/products";

type ProductPayload = {
  id?: string;
  name?: string;
  description?: string;
  category?: string;
  price_cents?: number;
  stock_quantity?: number;
  image_url?: string;
  is_active?: boolean;
};

function unauthorized() {
  return NextResponse.json({ error: "Connexion admin requise." }, { status: 401 });
}

function configurationError() {
  return NextResponse.json(
    { error: "Configuration Supabase admin manquante." },
    { status: 503 }
  );
}

function normalizeProduct(body: ProductPayload) {
  const name = body.name?.trim();
  const category = body.category?.trim();

  if (!name || !category || typeof body.price_cents !== "number") {
    return null;
  }

  return {
    name,
    slug: slugify(name),
    description: body.description?.trim() || null,
    category,
    price_cents: Math.max(0, Math.round(body.price_cents)),
    stock_quantity: Math.max(0, Math.round(body.stock_quantity ?? 0)),
    image_url: body.image_url?.trim() || null,
    is_active: body.is_active ?? true
  };
}

export async function GET() {
  if (!isAdminSessionValid()) {
    return unauthorized();
  }

  const client = supabaseAdmin ?? supabase;

  if (!client) {
    return configurationError();
  }

  const { data, error } = await client
    .from("products")
    .select("id,name,slug,description,category,price_cents,stock_quantity,image_url,is_active,created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ products: data });
}

export async function POST(request: Request) {
  if (!isAdminSessionValid()) {
    return unauthorized();
  }

  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    return configurationError();
  }

  const body = (await request.json().catch(() => null)) as ProductPayload | null;
  if (!body) {
    return NextResponse.json({ error: "Produit invalide." }, { status: 400 });
  }

  const product = normalizeProduct(body);
  if (!product) {
    return NextResponse.json({ error: "Nom, categorie et prix requis." }, { status: 400 });
  }

  const query = body.id
    ? supabaseAdmin.from("products").update(product).eq("id", body.id).select().single()
    : supabaseAdmin.from("products").insert(product).select().single();

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ product: data });
}
