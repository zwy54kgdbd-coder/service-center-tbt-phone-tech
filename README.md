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
- Siege: Centre commercial Auchan, Route de Cambrai, 59450 Sin-le-Noble

## Demarrage local

```bash
npm install
npm run dev
```

Copier `.env.example` vers `.env.local`, puis renseigner les variables Supabase.

## Supabase

Le schema initial est dans `supabase/migrations/0001_initial_schema.sql`.

Projet Supabase cree:

- Project ID: `zdrxmoifktpjsognhwfi`
- Project URL: `https://zdrxmoifktpjsognhwfi.supabase.co`

Ordre conseille:

1. Creer un projet Supabase.
2. Executer la migration SQL.
3. Ajouter les variables `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` dans `.env.local`.
4. Ajouter les memes variables dans Vercel.

## Deploiement Vercel

1. Creer un repo GitHub.
2. Pousser ce projet.
3. Importer le repo dans Vercel.
4. Ajouter les variables d'environnement.
5. Deployer.
