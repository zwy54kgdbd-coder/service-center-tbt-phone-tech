import Image from "next/image";
import {
  Clock3,
  Facebook,
  Images,
  MapPin,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Star,
  Wrench
} from "lucide-react";
import { HiddenAdminGate } from "@/components/hidden-admin-gate";
import { getPublicProducts } from "@/lib/products";
import { company, services, storePhotos } from "@/lib/site";

const stats = [
  { label: "Diagnostic", value: "Sur place" },
  { label: "Services", value: "Deblocage compte d'acces" },
  { label: "Adresse", value: "Auchan Sin-le-Noble" }
];

const mapUrl =
  "https://www.google.com/maps/search/?api=1&query=RTE%20DE%20CAMBRAI%20CENTRE%20COMMERCIAL%20AUCHAN%20LES%20EPIS%2059450%20SIN-LE-NOBLE";

export default async function Home() {
  const publicProducts = await getPublicProducts();

  return (
    <main>
      <header className="site-header" aria-label="Navigation principale">
        <HiddenAdminGate logo={company.logo} brand={company.brand} />
        <nav>
          <a href="#services">Services</a>
          <a href="#boutique">Boutique</a>
          <a href="#catalogue">Catalogue</a>
          <a href="#avis">Avis</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <section id="accueil" className="hero">
        <Image
          className="hero-image"
          src="/images/shop-hero.png"
          alt=""
          fill
          sizes="100vw"
          priority
        />
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1>{company.brand}</h1>
          <p className="hero-copy">
            Reparation mobile, tablette, ordinateur portable et fixe, console de jeux, accessoires,
            conseil et vente au centre commercial Auchan de Sin-le-Noble.
          </p>
          <div className="hero-actions">
            <a className="button primary" href={mapUrl} target="_blank" rel="noreferrer">
              <MapPin size={18} />
              Nous trouver
            </a>
            <a className="button secondary" href={`tel:${company.phone}`}>
              <Phone size={18} />
              Telephone
            </a>
            <a className="button secondary" href="#services">
              <Wrench size={18} />
              Voir les services
            </a>
          </div>
        </div>
        <div className="stat-row" aria-label="Informations rapides">
          {stats.map((stat) => (
            <div className="stat" key={stat.label}>
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
            </div>
          ))}
        </div>
      </section>

      <section id="services" className="section services-section">
        <div className="section-heading">
          <p className="eyebrow">Atelier & boutique</p>
          <h2>Des services simples, rapides et utiles</h2>
        </div>
        <div className="service-grid">
          {services.map((service, index) => {
            const icons = [Smartphone, ShoppingBag, ShieldCheck];
            const Icon = icons[index] ?? Smartphone;
            return (
              <article className="service-card" key={service.title}>
                <Icon size={30} />
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section id="boutique" className="section gallery-section">
        <div className="section-heading gallery-heading">
          <div>
            <p className="eyebrow">En boutique</p>
            <h2>Photos du magasin et des arrivages</h2>
          </div>
          <a className="button gallery-button" href={company.facebook} target="_blank" rel="noreferrer">
            <Images size={18} />
            Facebook
          </a>
        </div>
        <div className="gallery-grid">
          {storePhotos.map((photo, index) => (
            <figure className={index === 0 ? "gallery-item large" : "gallery-item"} key={photo.src}>
              <Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 860px) 100vw, 33vw" />
            </figure>
          ))}
        </div>
      </section>

      <section id="catalogue" className="section catalogue-section">
        <div className="section-heading">
          <p className="eyebrow">Premiere selection</p>
          <h2>Catalogue pret pour Supabase</h2>
        </div>
        <div className="product-grid">
          {publicProducts.map((product) => (
            <article className="product-card" key={product.name}>
              <span>{product.category}</span>
              <h3>{product.name}</h3>
              <strong>{product.price}</strong>
            </article>
          ))}
        </div>
      </section>

      <section id="avis" className="review-section">
        <div>
          <p className="eyebrow">Avis Google</p>
          <h2>Votre retour compte</h2>
          <p>
            Partagez votre experience avec SERVICE CENTER TBT PHONE TECH apres votre passage en boutique.
          </p>
          <div className="stars" aria-label="Avis clients">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} size={22} fill="currentColor" />
            ))}
          </div>
        </div>
        <a className="button review-button" href={company.googleReviewUrl} target="_blank" rel="noreferrer">
          <Star size={18} fill="currentColor" />
          Donner un avis
        </a>
      </section>

      <section id="contact" className="section contact-section">
        <div className="contact-main">
          <p className="eyebrow">Contact</p>
          <h2>Retrouvez-nous en boutique</h2>
          <p>{company.address}</p>
          <div className="contact-actions">
            <a className="button primary" href={mapUrl} target="_blank" rel="noreferrer">
              <MapPin size={18} />
              Itineraire
            </a>
            <a className="button secondary" href={`tel:${company.phone}`}>
              <Phone size={18} />
              Appeler
            </a>
            <a className="button secondary" href={company.googleReviewUrl} target="_blank" rel="noreferrer">
              <Star size={18} />
              Laisser un avis
            </a>
            <a className="button secondary" href={company.facebook} target="_blank" rel="noreferrer">
              <Facebook size={18} />
              Facebook
            </a>
          </div>
        </div>
        <aside className="legal-box">
          <Clock3 size={22} />
          <strong>{company.legalName}</strong>
          <span>{company.legalForm}</span>
          <span>{company.rcs}</span>
          <span>SIRET {company.siret}</span>
        </aside>
      </section>
    </main>
  );
}
