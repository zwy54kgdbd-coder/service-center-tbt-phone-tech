"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Check, Eye, EyeOff, LogOut, Plus, Save } from "lucide-react";
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

function priceToCents(value: string) {
  const normalized = value.replace(",", ".").replace(/[^\d.]/g, "");
  return Math.round(Number(normalized || 0) * 100);
}

export function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const activeProductsCount = useMemo(
    () => products.filter((product) => product.is_active).length,
    [products]
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

  useEffect(() => {
    loadProducts();
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

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <main className="admin-page">
      <header className="admin-header">
        <div>
          <p className="eyebrow">Acces prive</p>
          <h1>Gestion du catalogue</h1>
          <span>
            {products.length} produits, {activeProductsCount} visibles
          </span>
        </div>
        <button className="button secondary" type="button" onClick={handleLogout}>
          <LogOut size={18} />
          Sortir
        </button>
      </header>

      <section className="admin-workspace">
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
      </section>
    </main>
  );
}
