# AlloPuno — guide du dépôt

Marketplace de services et de locations pour le Kosovo. **Lire `docs/00-synthese-decisions.md` avant toute décision d'architecture** — le dossier `docs/` (00→08 + `schema.sql`) fait foi.

## Structure

```
apps/web            Next.js 15 App Router — site public (sq par défaut, /en)
packages/i18n       catalogues de traduction sq/en par namespace + getMessages()
packages/data       taxonomie des catégories, villes du Kosovo (source des seeds)
docs/               dossier d'architecture (produit, DB, API, sécurité, roadmap)
```

À venir (roadmap doc 08) : `apps/api` (NestJS + Prisma sur `docs/schema.sql`), `apps/admin`.

## Commandes

```bash
pnpm install        # racine (pnpm 9, node >= 20)
pnpm dev            # turbo dev
pnpm build          # turbo build (à faire passer avant tout commit)
pnpm lint && pnpm typecheck
```

## Conventions non négociables

- **Zéro chaîne UI codée en dur** : tout passe par next-intl. Chaque clé existe en
  `sq` ET `en` (parité stricte) dans `packages/i18n/src/messages/<locale>/<ns>.json`.
  Nouveau namespace ⇒ l'enregistrer dans `packages/i18n/src/index.ts`.
- Navigation : `Link`/`useRouter` de `@/i18n/navigation`, jamais `next/link`.
- Pages serveur : `setRequestLocale(locale)` en tête ; `params`/`searchParams`
  sont des Promises (Next 15). `useSearchParams` client toujours sous `<Suspense>`.
- Design system : tokens Tailwind v4 dans `apps/web/src/app/globals.css`
  (brand-600 = #2240dd, neutres ink/muted/faint/line/paper/card/wash, sémantique
  success/warning/danger). Réutiliser `components/ui/*` ; mobile-first (390px d'abord).
- Style code : 2 espaces, double quotes, semicolons.
- Argent : entiers en euros (les montants en base seront en cents — doc 03).
- Les données de `apps/web/src/lib/demo.ts` sont la **démo v1** ; elles seront
  remplacées par l'API `/api/v1` (contrats dans `docs/04-api.md`) — toute nouvelle
  page passe par ces types pour que le câblage reste mécanique.
- Ranking/sponsorisé : jamais de faveur cachée au payant (CDC §16/§97) ; catégorie
  vide ⇒ état honnête, pas de fausse abondance (CDC §103).

## Déploiement / CI

GitHub Actions (`.github/workflows/ci.yml`) : install → lint → typecheck → build.
Le build doit rester vert sur chaque commit poussé.
