# 03 — Base de données

Couvre : CDC §76, §29, §35, §76, §115. Le DDL de référence est
[`schema.sql`](schema.sql) (PostgreSQL 16 + PostGIS, **validé : le fichier
s'exécute sans erreur sur une instance PostgreSQL 16 + PostGIS 3**) ; ce
document explique les choix de modélisation. En développement, le schéma sera porté en migrations
Prisma — `schema.sql` reste la spécification.

## 1. Vue par domaines

```
Référentiels   countries · cities · zones · categories · services · plans · settings
Identité       users · auth_identities · refresh_tokens · devices · consents
Profils        profiles · professional_profiles · professional_services
               businesses · business_members · portfolio_items · verifications
Demandes       requests · request_images · request_recipients
Matching       request_matches · pro_alert_preferences
Offres         offers · offer_images
Messagerie     conversations · conversation_participants · messages
Réputation     reviews · review_replies
Location       rentals · rental_images · rental_availability · bookings
Argent (dormant) payments · refunds · quotes · quote_items · invoices ·
               invoice_items · subscriptions
Engagement     notifications · notification_preferences · favorites · saved_searches
Confiance      reports · risk_events · sanctions · price_benchmarks · audit_logs
Data           analytics_events · data_requests
Contenu        media · cms_pages · admin_roles
```

Toutes les tables de la liste minimale du CDC §76 sont couvertes ; deux écarts
volontaires, documentés ci-dessous : `subcategories` (fusionnée dans
`categories.parent_id`) et `request_images`/`rental_images` (tables de liaison
vers `media`).

## 2. Choix de modélisation clés

### Un compte, plusieurs capacités (CDC §4)
`users` porte l'identité et l'auth ; `profiles` (toujours),
`professional_profiles` (0..1) et `business_members` (0..n) sont des extensions.
Activer une capacité = créer une ligne, jamais un second compte.

### Taxonomie hiérarchique (CDC §32)
`categories.parent_id` remplace une table `subcategories` séparée : profondeur
arbitraire, une seule FK partout (`requests.category_id` +
`requests.subcategory_id` pour le confort de requêtage), synonymes de recherche
(`search_synonyms`) et unité de prix par défaut portés par la catégorie. La
taxonomie complète du CDC §32 sera chargée en seed, éditable en admin.

### Géolocalisation & privacy (CDC §29)
Colonnes `geography(Point,4326)` + index GIST sur `professional_profiles`,
`requests`, `rentals`. La position publique d'une demande est **approximative**
(arrondie côté application) ; `requests.exact_address` est chiffrée
applicativement et révélée uniquement après acceptation d'une offre, selon
`categories.requires_exact_address_after_match`.

### Argent en entiers
`*_cents bigint` + `currency char(3)`. Jamais de flottants. Multi-devise prêt
(CDC §129) même si tout est EUR au lancement.

### Statistiques dénormalisées, faits normalisés
`professional_profiles` porte des agrégats (rating, taux de réponse, prestations)
**recalculés par jobs** depuis les tables de faits (`reviews`, `offers`,
`request_matches`). Les listes et le matching lisent les agrégats (rapide) ; la
vérité reste dans les faits (auditables, recalculables).

### Calendrier de location sans double réservation (CDC §35)
`rental_availability` utilise `daterange` + contrainte d'exclusion GIST
(`rental_id WITH =, date_range WITH &&`) : le chevauchement est **impossible au
niveau base**, pas seulement au niveau applicatif.

### Traçabilité du matching (CDC §16)
`request_matches` conserve le score **et le détail par facteur**
(`score_factors` jsonb) pour chaque diffusion : débogage, transparence,
apprentissage des pondérations, et métriques (temps entre notification et
réponse).

### Modération & risk intégrés aux entités
`requests.risk_score`, `rentals.risk_score`, `messages.risk_flags`,
`reviews.risk_flags` portent la sortie du Risk Engine ; `risk_events` centralise
l'historique (Risk Center), `sanctions` matérialise l'échelle graduée du CDC §49,
`price_benchmarks` stocke les percentiles de prix par catégorie×ville×unité pour
la détection contextuelle (CDC §13).

### Partitionnement des tables à forte croissance (CDC §115)
`analytics_events`, `notifications`, `risk_events`, `audit_logs` sont
partitionnées par mois (RANGE sur `created_at`) : purge par détachement de
partition, index compacts, rétention pilotée par les politiques du doc 05.

### RGPD structurel (CDC §71–72, §113)
Soft-delete sur `users` (purge/anonymisation différée par job), `consents` par
finalité, `data_requests` pour export/suppression, IP et fingerprints **toujours
hashés** (`ip_hash`, `fingerprint_hash`), pièces de vérification purgées après
décision.

## 3. Index — stratégie

| Besoin | Index |
|---|---|
| Matching géo (« pros dans le rayon ») | GIST sur `professional_profiles.base_location`, filtre `ST_DWithin` |
| Flux de demandes publiées par catégorie | partiel `requests(category_id, status, published_at DESC) WHERE status='published'` |
| Boîte de réception messagerie | `messages(conversation_id, created_at DESC)` + `conversation_participants(user_id, last_read_at)` |
| Recherche texte de secours (hors Meilisearch) | GIN trigram sur `requests.title` |
| Files admin | partiels sur `reports(status)`, `sanctions WHERE revoked_at IS NULL`, `verifications` actives |
| Unicités métier | 1 offre par (pro, demande) ; 1 avis par (auteur, demande) ; 1 abonnement actif par user ; 1 vérification active par (user, type) |

Règle de revue : toute nouvelle requête sur un chemin chaud doit montrer son
`EXPLAIN` en PR (pas de seq scan sur tables de faits).

## 4. Croissance & évolution

- Migrations **expand → migrate → contract** uniquement (compatibles rollback,
  cf. doc 01 §7).
- Read replica pour recherche/analytics à partir de ~100k utilisateurs.
- Le multi-pays est déjà dans le modèle (`countries`, `cities`, devise par
  ligne) : l'expansion internationale (CDC §129) est un ajout de données, pas
  une migration de schéma.
