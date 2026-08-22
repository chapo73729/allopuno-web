# 01 — Architecture technique

Couvre : CDC §66–68, §73–75, §77–78, §90–93, §115–120, §129.

## 1. Vue d'ensemble

```
                        ┌──────────────────────────────────────────┐
                        │                CDN (edge)                │
                        │   assets, images optimisées, pages ISR   │
                        └───────────────┬──────────────────────────┘
                                        │
        ┌───────────────┬───────────────┴───────────────┐
        │  apps/web     │  apps/admin                   │  apps/mobile (Phase 5)
        │  Next.js SSR/ │  Next.js                      │  React Native / Expo
        │  ISR + PWA    │                               │
        └───────┬───────┴───────────────┬───────────────┘
                │ HTTPS (REST /api/v1)  │ WebSocket (messagerie, présence)
                ▼                       ▼
        ┌──────────────────────────────────────────────────────────┐
        │                   apps/api — NestJS                      │
        │  ┌────────────────────────────────────────────────────┐  │
        │  │ Modules : Auth · Users · Profiles · Businesses ·   │  │
        │  │ Categories · Requests · Offers · Matching ·        │  │
        │  │ Messaging · Reviews · Rentals · Bookings ·         │  │
        │  │ Payments · Invoices · Quotes · Notifications ·     │  │
        │  │ Moderation · Risk · Search · Analytics ·           │  │
        │  │ Subscriptions · AIService · Admin · CMS            │  │
        │  └────────────────────────────────────────────────────┘  │
        │  Event bus interne + producteurs de jobs                 │
        └────┬───────────┬────────────┬───────────┬────────────────┘
             │           │            │           │
             ▼           ▼            ▼           ▼
        PostgreSQL   Redis        Meilisearch   S3/R2 + CDN
        16 + PostGIS (cache,      (search       (média)
        (vérité)     BullMQ)      index)
                         │
                         ▼
              ┌─────────────────────────┐
              │  Workers (mêmes images  │
              │  de conteneur, rôle     │
              │  "worker") : matching,  │
              │  notifications, emails, │
              │  modération, IA, images,│
              │  analytics, indexation  │
              └─────────────────────────┘
```

Principes :

- **Un seul déploiement backend** (modular monolith, décision D1) avec deux rôles
  de processus : `api` (HTTP + WS) et `worker` (consommateurs BullMQ). Même code,
  scaling indépendant.
- **Tout ce qui peut être asynchrone l'est** (CDC §92) : l'utilisateur n'attend
  jamais la modération, le matching, l'envoi de notifications, le traitement
  d'images ni l'IA. Réponse API immédiate + statuts.
- **Événements internes** : chaque module émet des événements de domaine
  (`request.published`, `offer.created`, `review.submitted`…). Matching,
  notifications, analytics, search-indexing et risk s'y abonnent. C'est ce qui
  garde les modules découplés et rend l'extraction future en services possible.

## 2. Monorepo

Turborepo + pnpm (décision D4). Arborescence cible :

```
apps/
  web/          # Next.js App Router — public + dashboards user/pro
  admin/        # Next.js — back-office (déployé sur sous-domaine admin.*)
  api/          # NestJS — REST + WS + workers
packages/
  ui/           # design system : tokens, composants, icônes, états (CDC §2, §84)
  i18n/         # messages sq/en (+ fr/de/it préparés), typés, zéro hardcode (§69)
  schemas/      # Zod : DTOs partagés client/serveur, source des types OpenAPI
  config/       # eslint, tsconfig, tailwind preset, prettier
docs/           # ce dossier
.github/workflows/  # CI/CD
```

Règles :

- `packages/schemas` est la **source unique de vérité des contrats** : chaque DTO
  Zod y est défini une fois, validé côté serveur (pipe NestJS) et typé côté client.
- `packages/ui` implémente le design system (couleurs, typo, boutons, badges,
  cartes, formulaires, états, modales, notifications, grille — CDC §2) en
  mobile-first strict (CDC §67).

## 3. Frontend

- **Next.js 15, App Router.** Pages publiques SEO en SSG/ISR (revalidation à la
  publication de contenu), pages authentifiées en RSC + client components.
- **Performance (CDC §66)** : budget par page (LCP < 2 s sur mobile 4G, JS initial
  < 170 kB gz sur les pages publiques), `next/image` + AVIF/WebP, lazy loading,
  code splitting par route, fonts locales, zéro librairie UI lourde.
- **PWA (CDC §68)** : manifest + service worker (offline shell, push web). L'app
  mobile native (Expo) vient en Phase 5 et consomme la même API.
- **i18n** : routing par locale (`/sq` par défaut sans préfixe, `/en/...`),
  `hreflang`, formats locaux (EUR, téléphones +383 — CDC §70).
- **SEO (CDC §64–65)** : pages programmatiques `/sherbime/[cat]`,
  `/profesionist/[cat]/[qyteti]`, `/qira/[cat]` rendues côté serveur avec title,
  meta, H1, FAQ, JSON-LD (`LocalBusiness`, `Service`, `FAQPage`, `AggregateRating`),
  sitemap dynamique, liens internes. Publication conditionnée à du contenu réel
  (décision D11).

## 4. Backend

- **NestJS + TypeScript strict.** Un module par domaine (liste CDC §75), chacun
  avec : controller (HTTP), service (logique), repository (Prisma), events,
  jobs. Dépendances inter-modules uniquement via interfaces publiques et events.
- **API REST versionnée** `/api/v1` (CDC §74), documentation OpenAPI générée
  depuis les schémas Zod. `/api/v2` = nouveau routeur, jamais de breaking change
  silencieux. Détail : doc 04.
- **WebSockets** : gateway Socket.IO pour messagerie temps réel, read receipts,
  typing, présence « DISPO TANI » (CDC §27, §31). Auth par le même token que
  l'API. Adapter Redis pour le scale horizontal.
- **Prisma** comme ORM par défaut ; SQL natif (via Prisma `$queryRaw` typé) pour
  les requêtes PostGIS et les agrégations analytics.
- **Idempotence** : endpoints de création sensibles (offres, bookings, paiements
  futurs) acceptent une clé d'idempotence.

## 5. Données

- **PostgreSQL 16 + PostGIS** managé, backups automatiques + PITR, test de
  restauration trimestriel documenté (CDC §90). Schéma complet : doc 03.
- **Redis** : cache applicatif (TTL courts, invalidation par événement), rate
  limiting, sessions WS, files BullMQ.
- **Meilisearch** : index `professionals`, `requests`, `rentals`, `services`.
  Alimenté par les événements de domaine (indexation asynchrone, retry). Synonymes
  albanais et fautes de frappe gérés nativement (CDC §77) ; dictionnaire de
  synonymes éditable en admin. La recherche sémantique (embeddings) viendra en
  Phase 5 derrière la même interface du module Search.
- **S3/R2 + CDN** : uploads en URL présignées, pipeline worker `sharp`
  (strip EXIF/GPS, resize, WebP/AVIF, thumbnails), scan de contenu interdit via
  AIService avant publication (CDC §93).

## 6. Environnements & configuration (CDC §117)

| Env | Usage | Données |
|---|---|---|
| development | local (docker-compose : postgres, redis, meilisearch, minio, mailpit) | seeds synthétiques uniquement |
| staging | validation pré-prod, données anonymisées ou synthétiques | jamais de données de prod |
| production | réel | backups + PITR |

- Configuration 12-factor : tout par variables d'environnement, validées au boot
  (schéma Zod) — l'app refuse de démarrer avec une config invalide.
- Secrets dans le secret manager de la plateforme d'hébergement, jamais en git.
- **Multi-pays prêt (CDC §129)** : `countries`, `cities`, devise, langues, règles
  fiscales et payment providers sont des données (cf. doc 03), pas de la config
  codée en dur. Lancement mono-pays (XK/EUR) sans sur-ingénierie multi-tenant.

## 7. CI/CD (CDC §118)

Pipeline GitHub Actions sur chaque PR puis sur `main` :

```
lint + typecheck → tests unit → tests intégration (postgres/redis en services)
→ build (turbo, cache) → security (audit deps, gitleaks, CodeQL)
→ deploy staging → tests E2E (Playwright) + smoke → gate manuel → deploy prod
```

- Migrations Prisma exécutées en étape dédiée, **toujours rétrocompatibles sur
  une version** (expand → migrate → contract) pour permettre le rollback.
- Rollback = redéploiement de l'image précédente (images immuables, taggées par
  SHA).
- Feature flags (table `settings` + cache) pour découpler déploiement et
  activation.

## 8. Observabilité (CDC §91)

- **Logs** structurés JSON (pino), corrélés par `request_id`/`trace_id`.
- **Traces & métriques** OpenTelemetry : latence API par route, profondeur des
  queues, durée des jobs, erreurs par module, hit-rate cache, santé Meilisearch.
- **Erreurs** : Sentry (api, web, admin, workers).
- **Alertes** : p95 API, taux d'erreur 5xx, backlog de queue, échec de jobs
  critiques (matching, notifications), espace disque DB, échec de backup.
- **Audit log** applicatif : cf. doc 05 (distinct des logs techniques).

## 9. Scalabilité (CDC §115)

Trajectoire assumée, sans sur-construire :

| Palier | Ce qui suffit |
|---|---|
| 0 → 10k utilisateurs | 1–2 instances api + 1 worker, Postgres managé small, Redis, Meilisearch single node |
| 10k → 100k | scale horizontal api/workers (stateless), read replica Postgres pour recherche/analytics, CDN agressif, partitionnement `analytics_events` et `notifications` |
| 100k → 1M+ | extraction éventuelle de modules chauds (Messaging, Search, AIService) en services, sharding par pays (l'i18n structurelle D9 rend le split par pays naturel), cluster Meilisearch/OpenSearch |

Garde-fous dès le MVP : pas d'état en mémoire process (tout en Redis/DB), N+1
interdits sur les routes chaudes (tests de requêtes), pagination par curseur
partout, index couvrants (doc 03), load tests k6 sur publication/matching/
messagerie avant chaque jalon (CDC §116).

## 10. Tests (CDC §116)

| Niveau | Outil | Cible |
|---|---|---|
| Unit | Vitest/Jest | services de domaine (matching score, risk score, pricing médian, réputation bayésienne) |
| Intégration | Jest + Testcontainers | repositories, transactions, events, jobs |
| API | supertest + OpenAPI validation | contrats `/api/v1` |
| E2E | Playwright | parcours critiques : inscription, publication ≤60 s, réponse, comparaison, messagerie, avis, admin/modération |
| Sécurité | CodeQL, audit deps, tests authz par rôle | CI bloquante |
| Charge | k6 | publication, matching, recherche, messagerie |

La Definition of Done (CDC §133) est appliquée par fonctionnalité : fonctionnel,
responsive, testé, sécurisé, documenté, branché analytics, compatible rôles, géré
côté admin, erreurs gérées, prêt pour la charge.
