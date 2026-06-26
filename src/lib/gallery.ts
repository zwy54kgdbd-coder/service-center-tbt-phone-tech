import { storePhotos } from "@/lib/site";
import { supabase } from "@/lib/supabase";

export type StorePhoto = {
  id?: string;
  title: string;
  alt: string;
  image_url: string;
  storage_path?: string | null;
  display_order: number;
  is_active: boolean;
};

export type DisplayStorePhoto = {
  id?: string;
  src: string;
  alt: string;
  title?: string;
};

export async function getPublicStorePhotos(): Promise<DisplayStorePhoto[]> {
  if (!supabase) {
    return storePhotos;
  }

  const { data, error } = await supabase
    .from("store_photos")
    .select("id,title,alt,image_url")
    .eq("is_active", true)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(8);

  if (error || !data?.length) {
    return storePhotos;
  }

  return data.map((photo) => ({
    id: photo.id,
    src: photo.image_url,
    alt: photo.alt,
    title: photo.title
  }));
}
