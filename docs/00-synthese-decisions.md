# 00 — Synthèse & décisions structurantes

## 1. Ce qu'est ALLOPUNO (rappel en une phrase)

Une marketplace de mise en relation locale (Kosovo d'abord, international ensuite)
dont le cœur n'est pas un annuaire mais une boucle :
**demande → diffusion intelligente → offres → comparaison → choix → messagerie →
prestation → avis → réputation** (CDC §1, §126, §128), avec un second pilier
**location (QIRA)** (CDC §33–37).

## 2. Décisions structurantes

Chaque décision est réversible ou non ; les irréversibles sont marquées 🔒.

### D1 🔒 — Modular monolith d'abord, pas de microservices

Un backend unique **NestJS** organisé en modules étanches (Auth, Users, Requests,
Offers, Matching, Messaging, Reviews, Rentals, Bookings, Payments, Quotes,
Invoices, Notifications, Moderation, Risk, Search, Analytics, Subscriptions —
CDC §75). Les modules communiquent par événements internes (event bus) et jobs de
queue, jamais par import direct de leurs internals.

**Pourquoi :** une équipe réduite, un marché à conquérir, une exigence de vitesse
d'itération. Les microservices au jour 1 tueraient la vélocité. La discipline
modulaire + les queues permettent d'extraire plus tard un module en service
autonome (le premier candidat est l'AI Service, CDC §78, déjà isolé derrière une
interface). C'est exactement « le MVP est la première version du produit final »
(CDC §122).

### D2 🔒 — PostgreSQL 16 + PostGIS comme source de vérité unique

Toutes les données transactionnelles dans PostgreSQL. PostGIS pour la
géolocalisation (distance, rayon d'intervention, matching géographique — CDC §29,
§14). Redis pour cache + queues. **Meilisearch** pour la recherche full-text
(tolérance aux fautes, synonymes albanais `hidraulik/ujë/rrjedhje` → plomberie,
géo-filtres — CDC §77), alimenté par événements depuis PostgreSQL.

**Pourquoi Meilisearch et pas Elasticsearch :** typo-tolerance et synonymes
excellents out of the box, opérationnellement 10× plus simple, largement suffisant
jusqu'à des millions de documents. Migration vers Elasticsearch/OpenSearch
possible plus tard derrière le module Search sans toucher au reste.

### D3 — Frontend Next.js 15 (App Router) + TypeScript + Tailwind

Trois apps : `web` (site public + dashboards utilisateur/pro), `admin` (back-office),
plus tard `mobile` (React Native/Expo réutilisant la même API — CDC §68).

**Pourquoi :** SSR/SSG natifs pour le SEO structurel (CDC §64–65), Core Web Vitals
maîtrisables (CDC §66), PWA possible (CDC §68), et l'écosystème que l'équipe
pratique déjà (les autres dépôts du compte sont en Next.js). Mobile first par
défaut dans le design system (CDC §67, §84).

### D4 🔒 — Monorepo Turborepo + pnpm

```
allopuno/
├── apps/web        # Next.js — site public, dashboards user & pro
├── apps/admin      # Next.js — admin panel
├── apps/api        # NestJS — API /api/v1, WebSockets, workers
├── packages/ui     # design system (composants, tokens)
├── packages/i18n   # traductions sq/en (+fr/de/it préparés), zéro hardcode
├── packages/schemas# schémas Zod partagés (validation client+serveur, types API)
├── packages/config # eslint, tsconfig, tailwind preset
└── docs/           # ce dossier
```

**Pourquoi :** types partagés bout en bout (un schéma Zod = validation serveur +
types client + doc OpenAPI), refactorings transverses atomiques, un seul CI/CD.

### D5 — L'IA est un module interne avec abstraction proprement séparée

Un module `AIService` avec interface stable (`classify(text)`, `moderate(content)`,
`extractRequestFields(text)`, plus tard `estimatePrice`, `translate`, `assist` —
CDC §9, §11, §78–80). Implémentation v1 : appels LLM (API Claude) + règles +
dictionnaires de synonymes albanais, exécutés **en asynchrone via queue** pour ne
jamais bloquer l'utilisateur (CDC §92). Le parsing de demande en langage naturel
(« Më duhet një hidraulik në Prishtinë nesër ») est une fonctionnalité MVP car
c'est le cœur de l'UX de publication (CDC §9, §123).

### D6 — Moteur de matching : scoring pondéré, poids configurables en admin

Pipeline : pré-filtre géographique (PostGIS) + catégorie + disponibilité → scoring
pondéré (catégorie 25 %, distance 20 %, disponibilité 15 %, réputation 15 %, temps
de réponse 10 %, taux de réponse 5 %, historique 5 %, pertinence 5 % — CDC §16)
→ plafonnement (cap de notifications par pro, cap de destinataires par demande)
→ notification. Les poids vivent dans la table `settings`, modifiables sans
déploiement. Le sponsorisé est **toujours** étiqueté et ne modifie jamais le score
organique (CDC §16, §50, §97). Détail : [06-matching-notifications.md](06-matching-notifications.md).

### D7 — Risk Engine transversal, jamais binaire

Un score de risque 0–100 contextuel appliqué aux publications, prix, messages,
avis et comptes (CDC §12–13, §28, §46–47). Trois zones : ≤20 auto-publish, 21–60
contrôle renforcé, ≥61 blocage/modération humaine. La détection de prix absurdes
est **contextuelle** (prix vs médiane de la catégorie/localisation/unité), jamais
une règle rigide « prix bas = bloqué ». Sanctions graduées configurables (warning
→ limitation → suspension → vérification requise → ban — CDC §49). Priorité
explicite : éviter les faux positifs (CDC §12, §125).

### D8 🔒 — Paiements : abstraction `PaymentProvider`, aucun prestataire verrouillé

Architecture complète (paiement, acompte, caution, remboursement, annulation —
CDC §38) codée contre une interface. Aucune intégration réelle avant vérification
de la disponibilité légale/technique du prestataire au Kosovo. Le MVP n'a **aucun
paiement actif** (2 ans gratuits — CDC §54) ; les tables et statuts existent dès
le départ.

### D9 — Internationalisation structurelle dès le schéma

`country`, `currency`, `language`, `city`, taxonomie, règles fiscales et légales
sont des données configurables, pas des constantes (CDC §69–70, §129). Lancement :
albanais + anglais, EUR, villes kosovares. Les libellés (catégories, pages CMS)
sont des JSONB multilingues en base ; les textes d'interface vivent dans
`packages/i18n`.

### D10 — Gratuit 2 ans, monétisation dormante

Tables `subscriptions`/`plans` présentes dès le MVP, tout le monde en plan FREE,
aucun paywall dans le code de parcours. Les capacités futures (PRO, PRO+, BOOST,
PREMIUM, mise en avant, CRM avancé) sont des **feature flags par plan**, pas des
branches de code à réécrire (CDC §54–58).

### D11 — SEO structurel comme fonctionnalité de premier rang

Pages indexables générées à partir des données réelles :
`/sherbime/[category]`, `/profesionist/[category]/[city]`, `/qira/[category]`,
avec title/meta/H1/FAQ/données structurées schema.org/liens internes (CDC §64–65).
Rendu SSG/ISR. Pas de génération de masse sans valeur : une page n'est publiée que
si elle a du contenu réel (professionnels, demandes, guide éditorial).

### D12 — Honnêteté marketplace intégrée au produit

Catégorie sans offre → « Nous recherchons des professionnels dans cette
catégorie » + opt-in d'alerte, jamais de fausse abondance (CDC §103). Réputation
pondérée par le volume (score bayésien : un 5★ unique ne bat pas 200 prestations
à 4,9★ — CDC §25). Badges uniquement après vraie vérification (CDC §24).

## 3. Stack retenue (résumé)

| Couche | Choix | CDC |
|---|---|---|
| Frontend web + admin | Next.js 15, TypeScript, Tailwind, shadcn-style DS | §64–68, §84 |
| Backend API | NestJS (modular monolith), REST `/api/v1`, OpenAPI | §74–75 |
| Temps réel | WebSockets (Socket.IO gateway NestJS) | §27 |
| Base de données | PostgreSQL 16 + PostGIS, Prisma (ORM) + SQL natif ciblé | §76 |
| Cache & queues | Redis + BullMQ (jobs : matching, notifs, IA, images, analytics) | §92 |
| Recherche | Meilisearch (typo-tolerance, synonymes sq, geo) | §77 |
| Stockage média | S3-compatible (Cloudflare R2) + CDN + pipeline images (sharp → WebP/AVIF, thumbnails) | §23, §93 |
| IA | Module AIService → API Claude + règles, en queue | §9, §11, §78 |
| Notifications | Push (FCM/Web Push), email (provider transactionnel), SMS OTP (provider couvrant le Kosovo) | §53 |
| Observabilité | OpenTelemetry, Sentry, logs structurés, alerting | §91 |
| CI/CD | GitHub Actions : lint → tests → build → security → staging → prod, rollback | §118 |
| Environnements | development / staging / production, données de prod jamais en dev | §117 |

## 4. Risques identifiés & mitigations

| # | Risque | Impact | Mitigation |
|---|---|---|---|
| R1 | **Marketplace vide** (pas d'offre au lancement) | Fatal | Recrutement actif de pros avant le lancement grand public, ville par ville (CDC §99) ; honnêteté d'affichage + alertes (CDC §103) ; KPI nord : % de demandes avec ≥1 réponse pertinente (CDC §60, §102) |
| R2 | SMS OTP au Kosovo (coût, délivrabilité, prestataires) | Bloquant inscription | Vérifier tôt (Phase 0) les providers couvrant les opérateurs kosovars (Vala, IPKO…) ; fallback : vérification par appel manqué ou WhatsApp OTP ; email reste une voie d'inscription |
| R3 | Paiements en ligne au Kosovo (couverture des PSP) | Bloque la Phase 4 seulement | Abstraction `PaymentProvider` (D8) ; le produit fonctionne 2 ans sans paiement |
| R4 | Vérification d'entreprise (registres kosovars, procédures) | Badge « entreprise vérifiée » | Processus manuel assisté en v1 (upload de documents + revue admin), automatisation quand une source fiable existe (CDC §96) |
| R5 | NLU albanais (parsing des demandes) | Qualité du cœur UX | LLM + dictionnaires de synonymes/catégories maintenus en admin ; toujours une confirmation utilisateur avant publication (l'IA propose, l'utilisateur valide — CDC §9) ; fallback formulaire court |
| R6 | Faux positifs de modération | Perte de confiance | Zones de score (D7), revue humaine sur la zone grise, métriques de faux positifs dans le Risk Center |
| R7 | Cartographie (tuiles, geocoding villes/quartiers kosovars) | Carte & distances | OpenStreetMap (bonne couverture Kosovo) + serveur de tuiles managé ; géocodage par référentiel interne de villes/zones plutôt que par API externe |
| R8 | Dérive de périmètre (134 sections !) | Ne jamais livrer | Roadmap par phases stricte (doc 08), MVP = CDC §121 uniquement, Definition of Done (CDC §133) appliquée par fonctionnalité |

## 5. Points nécessitant une validation du propriétaire produit

1. **Le périmètre MVP** proposé (doc 08, aligné sur CDC §121) — y compris la
   décision d'y inclure le parsing IA de demande et d'en exclure la location.
2. **Le choix Meilisearch** (D2) et **NestJS/Next.js/Turborepo** (D1, D3, D4).
3. La stratégie **OTP SMS** (R2) — budget et prestataire à confirmer.
4. Le nom de domaine et la langue des slugs SEO (proposition : slugs albanais
   `/sherbime/...`, `/qira/...` — cohérent avec le marché).
5. L'hébergement cible (proposition doc 01 : conteneurs managés EU + Postgres
   managé ; coût maîtrisé, RGPD-compatible, sans lock-in).

Une fois ces points validés, la Phase 1 (MVP) démarre selon la roadmap du doc 08.
