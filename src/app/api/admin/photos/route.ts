import { NextResponse } from "next/server";
import { isAdminSessionValid } from "@/lib/admin/auth";
import { isSupabaseAdminConfigured, supabaseAdmin } from "@/lib/admin/supabase-admin";
import { supabase } from "@/lib/supabase";

const BUCKET = "store-photos";

function unauthorized() {
  return NextResponse.json({ error: "Connexion admin requise." }, { status: 401 });
}

function configurationError() {
  return NextResponse.json(
    { error: "Configuration Supabase admin manquante." },
    { status: 503 }
  );
}

function formText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
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
    .from("store_photos")
    .select("id,title,alt,image_url,storage_path,display_order,is_active,created_at")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ photos: data });
}

export async function POST(request: Request) {
  if (!isAdminSessionValid()) {
    return unauthorized();
  }

  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    return configurationError();
  }

  const formData = await request.formData().catch(() => null);

  if (!formData) {
    return NextResponse.json({ error: "Photo invalide." }, { status: 400 });
  }

  const id = formText(formData, "id");
  const title = formText(formData, "title") || "Photo du magasin";
  const alt = formText(formData, "alt") || title;
  const displayOrder = Number(formText(formData, "display_order") || 0);
  const isActive = formText(formData, "is_active") !== "false";
  let imageUrl = formText(formData, "image_url");
  let storagePath = formText(formData, "storage_path") || null;
  const file = formData.get("file");

  if (file instanceof File && file.size > 0) {
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Le fichier doit etre une image." }, { status: 400 });
    }

    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    storagePath = `${Date.now()}-${crypto.randomUUID()}.${extension}`;
    const bytes = await file.arrayBuffer();

    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(storagePath, bytes, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(storagePath);
    imageUrl = data.publicUrl;
  }

  if (!imageUrl) {
    return NextResponse.json({ error: "Ajoute une image ou une URL." }, { status: 400 });
  }

  const photo = {
    title,
    alt,
    image_url: imageUrl,
    storage_path: storagePath,
    display_order: Number.isFinite(displayOrder) ? displayOrder : 0,
    is_active: isActive
  };

  const query = id
    ? supabaseAdmin.from("store_photos").update(photo).eq("id", id).select().single()
    : supabaseAdmin.from("store_photos").insert(photo).select().single();

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ photo: data });
}

export async function DELETE(request: Request) {
  if (!isAdminSessionValid()) {
    return unauthorized();
  }

  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    return configurationError();
  }

  const { id } = (await request.json().catch(() => ({}))) as { id?: string };

  if (!id) {
    return NextResponse.json({ error: "Photo manquante." }, { status: 400 });
  }

  const { data: photo, error: readError } = await supabaseAdmin
    .from("store_photos")
    .select("storage_path")
    .eq("id", id)
    .single();

  if (readError) {
    return NextResponse.json({ error: readError.message }, { status: 500 });
  }

  const { error } = await supabaseAdmin.from("store_photos").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (photo?.storage_path) {
    await supabaseAdmin.storage.from(BUCKET).remove([photo.storage_path]);
  }

  return NextResponse.json({ ok: true });
}
