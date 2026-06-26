"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Check, Eye, EyeOff, Image as PhotoIcon, LogOut, Plus, Save, Trash2 } from "lucide-react";
import type { StorePhoto } from "@/lib/gallery";
import type { Product } from "@/lib/products";
import { formatPrice } from "@/lib/products";

type ProductForm = {
  id: string;
  name: string;
  description: string;
  category: string;
  price: string;
  stock_quantity: string;
  image_url: string;
  is_active: boolean;
};

type PhotoForm = {
  id: string;
  title: string;
  alt: string;
  image_url: string;
  storage_path: string;
  display_order: string;
  is_active: boolean;
  file: File | null;
};

const emptyForm: ProductForm = {
  id: "",
  name: "",
  description: "",
  category: "",
  price: "",
  stock_quantity: "0",
  image_url: "",
  is_active: true
};

const emptyPhotoForm: PhotoForm = {
  id: "",
  title: "",
  alt: "",
  image_url: "",
  storage_path: "",
  display_order: "0",
  is_active: true,
  file: null
};

function productToForm(product: Product): ProductForm {
  return {
    id: product.id ?? "",
    name: product.name,
    description: product.description ?? "",
    category: product.category,
    price: String((product.price_cents / 100).toFixed(2)).replace(".", ","),
    stock_quantity: String(product.stock_quantity),
    image_url: product.image_url ?? "",
    is_active: product.is_active
  };
}

function photoToForm(photo: StorePhoto): PhotoForm {
  return {
    id: photo.id ?? "",
    title: photo.title,
    alt: photo.alt,
    image_url: photo.image_url,
    storage_path: photo.storage_path ?? "",
    display_order: String(photo.display_order),
    is_active: photo.is_active,
    file: null
  };
}

function priceToCents(value: string) {
  const normalized = value.replace(",", ".").replace(/[^\d.]/g, "");
  return Math.round(Number(normalized || 0) * 100);
}

export function AdminProducts() {
  const [activeTab, setActiveTab] = useState<"products" | "photos">("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [photos, setPhotos] = useState<StorePhoto[]>([]);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [photoForm, setPhotoForm] = useState<PhotoForm>(emptyPhotoForm);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isPhotosLoading, setIsPhotosLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPhotoSaving, setIsPhotoSaving] = useState(false);

  const activeProductsCount = useMemo(
    () => products.filter((product) => product.is_active).length,
    [products]
  );

  const activePhotosCount = useMemo(
    () => photos.filter((photo) => photo.is_active).length,
    [photos]
  );

  async function loadProducts() {
    setIsLoading(true);
    setError("");

    const response = await fetch("/api/admin/products", { cache: "no-store" });
    const data = await response.json().catch(() => null);

    setIsLoading(false);

    if (!response.ok) {
      setError(data?.error ?? "Impossible de charger les produits.");
      return;
    }

    setProducts(data.products ?? []);
  }

  async function loadPhotos() {
    setIsPhotosLoading(true);
    setError("");

    const response = await fetch("/api/admin/photos", { cache: "no-store" });
    const data = await response.json().catch(() => null);

    setIsPhotosLoading(false);

    if (!response.ok) {
      setError(data?.error ?? "Impossible de charger les photos.");
      return;
    }

    setPhotos(data.photos ?? []);
  }

  useEffect(() => {
    loadProducts();
    loadPhotos();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setStatus("");
    setError("");

    const response = await fetch("/api/admin/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id: form.id || undefined,
        name: form.name,
        description: form.description,
        category: form.category,
        price_cents: priceToCents(form.price),
        stock_quantity: Number(form.stock_quantity || 0),
        image_url: form.image_url,
        is_active: form.is_active
      })
    });

    const data = await response.json().catch(() => null);
    setIsSaving(false);

    if (!response.ok) {
      setError(data?.error ?? "Impossible d'enregistrer.");
      return;
    }

    setStatus(form.id ? "Produit mis a jour." : "Produit ajoute.");
    setForm(emptyForm);
    await loadProducts();
  }

  async function handlePhotoSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPhotoSaving(true);
    setStatus("");
    setError("");

    const payload = new FormData();
    payload.set("id", photoForm.id);
    payload.set("title", photoForm.title);
    payload.set("alt", photoForm.alt);
    payload.set("image_url", photoForm.image_url);
    payload.set("storage_path", photoForm.storage_path);
    payload.set("display_order", photoForm.display_order);
    payload.set("is_active", String(photoForm.is_active));

    if (photoForm.file) {
      payload.set("file", photoForm.file);
    }

    const response = await fetch("/api/admin/photos", {
      method: "POST",
      body: payload
    });

    const data = await response.json().catch(() => null);
    setIsPhotoSaving(false);

    if (!response.ok) {
      setError(data?.error ?? "Impossible d'enregistrer la photo.");
      return;
    }

    setStatus(photoForm.id ? "Photo mise a jour." : "Photo ajoutee.");
    setPhotoForm(emptyPhotoForm);
    await loadPhotos();
  }

  async function handlePhotoDelete(photo: StorePhoto) {
    if (!photo.id || !window.confirm("Supprimer cette photo du site ?")) {
      return;
    }

    setStatus("");
    setError("");

    const response = await fetch("/api/admin/photos", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ id: photo.id })
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      setError(data?.error ?? "Impossible de supprimer la photo.");
      return;
    }

    setStatus("Photo supprimee.");
    await loadPhotos();
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <main className="admin-page">
      <header className="admin-header">
        <div>
          <p className="eyebrow">Acces prive</p>
          <h1>Gestion du site</h1>
          <span>
            {products.length} produits, {activeProductsCount} visibles - {photos.length} photos,{" "}
            {activePhotosCount} visibles
          </span>
        </div>
        <button className="button secondary" type="button" onClick={handleLogout}>
          <LogOut size={18} />
          Sortir
        </button>
      </header>

      <div className="admin-tabs" role="tablist" aria-label="Gestion du site">
        <button
          className={activeTab === "products" ? "admin-tab active" : "admin-tab"}
          type="button"
          onClick={() => setActiveTab("products")}
        >
          Catalogue
        </button>
        <button
          className={activeTab === "photos" ? "admin-tab active" : "admin-tab"}
          type="button"
          onClick={() => setActiveTab("photos")}
        >
          Photos
        </button>
      </div>

      {activeTab === "products" ? <section className="admin-workspace">
        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="admin-form-title">
            <h2>{form.id ? "Modifier le produit" : "Ajouter un produit"}</h2>
            {form.id ? (
              <button className="mini-button" type="button" onClick={() => setForm(emptyForm)}>
                <Plus size={16} />
                Nouveau
              </button>
            ) : null}
          </div>

          <label>
            Nom du produit
            <input
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              required
            />
          </label>

          <label>
            Categorie
            <input
              value={form.category}
              onChange={(event) => setForm({ ...form, category: event.target.value })}
              required
            />
          </label>

          <div className="admin-form-row">
            <label>
              Prix
              <input
                inputMode="decimal"
                placeholder="19,90"
                value={form.price}
                onChange={(event) => setForm({ ...form, price: event.target.value })}
                required
              />
            </label>
            <label>
              Stock
              <input
                inputMode="numeric"
                value={form.stock_quantity}
                onChange={(event) => setForm({ ...form, stock_quantity: event.target.value })}
              />
            </label>
          </div>

          <label>
            Description
            <textarea
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              rows={4}
            />
          </label>

          <label>
            Image URL
            <input
              value={form.image_url}
              onChange={(event) => setForm({ ...form, image_url: event.target.value })}
              placeholder="https://..."
            />
          </label>

          <label className="admin-toggle">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(event) => setForm({ ...form, is_active: event.target.checked })}
            />
            <span>{form.is_active ? "Visible sur le site" : "Masque du site"}</span>
          </label>

          {error ? <p className="admin-error">{error}</p> : null}
          {status ? (
            <p className="admin-success">
              <Check size={16} />
              {status}
            </p>
          ) : null}

          <button className="button primary" type="submit" disabled={isSaving}>
            <Save size={18} />
            {isSaving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </form>

        <div className="admin-list" aria-live="polite">
          {isLoading ? <p>Chargement...</p> : null}
          {!isLoading && products.length === 0 ? <p>Aucun produit pour le moment.</p> : null}
          {products.map((product) => (
            <article className="admin-product" key={product.id}>
              <div>
                <span>{product.category}</span>
                <h3>{product.name}</h3>
                <strong>{formatPrice(product.price_cents)}</strong>
              </div>
              <div className="admin-product-actions">
                <span className={product.is_active ? "status-pill active" : "status-pill"}>
                  {product.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                  {product.is_active ? "Visible" : "Masque"}
                </span>
                <button className="mini-button" type="button" onClick={() => setForm(productToForm(product))}>
                  Modifier
                </button>
              </div>
            </article>
          ))}
        </div>
      </section> : null}

      {activeTab === "photos" ? (
        <section className="admin-workspace">
          <form className="admin-form" onSubmit={handlePhotoSubmit}>
            <div className="admin-form-title">
              <h2>{photoForm.id ? "Modifier la photo" : "Ajouter une photo"}</h2>
              {photoForm.id ? (
                <button className="mini-button" type="button" onClick={() => setPhotoForm(emptyPhotoForm)}>
                  <Plus size={16} />
                  Nouvelle
                </button>
              ) : null}
            </div>

            <label>
              Fichier photo
              <input
                accept="image/*"
                type="file"
                onChange={(event) =>
                  setPhotoForm({ ...photoForm, file: event.target.files?.[0] ?? null })
                }
              />
            </label>

            <label>
              Ou image URL
              <input
                value={photoForm.image_url}
                onChange={(event) => setPhotoForm({ ...photoForm, image_url: event.target.value })}
                placeholder="https://..."
              />
            </label>

            <label>
              Titre
              <input
                value={photoForm.title}
                onChange={(event) => setPhotoForm({ ...photoForm, title: event.target.value })}
                placeholder="Vitrine du magasin"
              />
            </label>

            <label>
              Texte image
              <input
                value={photoForm.alt}
                onChange={(event) => setPhotoForm({ ...photoForm, alt: event.target.value })}
                placeholder="Photo de la boutique"
              />
            </label>

            <label>
              Ordre
              <input
                inputMode="numeric"
                value={photoForm.display_order}
                onChange={(event) => setPhotoForm({ ...photoForm, display_order: event.target.value })}
              />
            </label>

            <label className="admin-toggle">
              <input
                type="checkbox"
                checked={photoForm.is_active}
                onChange={(event) => setPhotoForm({ ...photoForm, is_active: event.target.checked })}
              />
              <span>{photoForm.is_active ? "Visible sur le site" : "Masquee du site"}</span>
            </label>

            {error ? <p className="admin-error">{error}</p> : null}
            {status ? (
              <p className="admin-success">
                <Check size={16} />
                {status}
              </p>
            ) : null}

            <button className="button primary" type="submit" disabled={isPhotoSaving}>
              <Save size={18} />
              {isPhotoSaving ? "Enregistrement..." : "Enregistrer la photo"}
            </button>
          </form>

          <div className="admin-list photo-list" aria-live="polite">
            {isPhotosLoading ? <p>Chargement...</p> : null}
            {!isPhotosLoading && photos.length === 0 ? <p>Aucune photo pour le moment.</p> : null}
            {photos.map((photo) => (
              <article className="admin-product admin-photo" key={photo.id}>
                <img src={photo.image_url} alt={photo.alt} />
                <div>
                  <span>{photo.display_order}</span>
                  <h3>{photo.title}</h3>
                  <strong>{photo.alt}</strong>
                </div>
                <div className="admin-product-actions">
                  <span className={photo.is_active ? "status-pill active" : "status-pill"}>
                    {photo.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                    {photo.is_active ? "Visible" : "Masquee"}
                  </span>
                  <button className="mini-button" type="button" onClick={() => setPhotoForm(photoToForm(photo))}>
                    <PhotoIcon size={16} />
                    Modifier
                  </button>
                  <button className="mini-button danger" type="button" onClick={() => handlePhotoDelete(photo)}>
                    <Trash2 size={16} />
                    Supprimer
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
