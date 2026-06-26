# SERVICE CENTER TBT PHONE TECH

Site web officiel de SERVICE CENTER TBT PHONE TECH, vitrine et base e-commerce pour la boutique de Sin-le-Noble.

## Stack

- Next.js
- Supabase
- Vercel
- TypeScript

## Societe

- Raison sociale: SERVICE CENTER TBT PHONE TECH
- Forme: SAS
- Capital: 1000 EUR
- RCS: 940 196 140 R.C.S. Douai
- SIRET: 94019614000013
- Siege: RTE DE CAMBRAI CENTRE COMMERCIAL AUCHAN LES EPIS 59450 SIN-LE-NOBLE

## Demarrage local

```bash
npm install
npm run dev
```

Copier `.env.example` vers `.env.local`, puis renseigner les variables Supabase.

## Supabase

Le schema initial est dans `supabase/migrations/0001_initial_schema.sql`.
La gestion des photos du magasin est dans `supabase/migrations/0002_store_photos.sql`.

Projet Supabase cree:

- Project ID: `zdrxmoifktpjsognhwfi`
- Project URL: `https://zdrxmoifktpjsognhwfi.supabase.co`

Ordre conseille:

1. Creer un projet Supabase.
2. Executer la migration SQL.
3. Ajouter les variables `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` dans `.env.local`.
4. Ajouter les memes variables dans Vercel.

## Acces admin cache

L'acces prive s'ouvre avec 3 appuis rapides sur le logo en haut a gauche du site. La page `/admin` permet de gerer le catalogue et les photos depuis mobile ou ordinateur.

Variables serveur necessaires:

- `ADMIN_USERNAME`
- `ADMIN_ACCESS_CODE`
- `ADMIN_SESSION_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY`

## Deploiement Vercel

Projet GitHub:

- https://github.com/zwy54kgdbd-coder/service-center-tbt-phone-tech

Projet Vercel:

- https://service-center-tbt-phone-tech.vercel.app

Variables d'environnement configurees en production:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `ADMIN_USERNAME`
- `ADMIN_ACCESS_CODE`
- `ADMIN_SESSION_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY`
