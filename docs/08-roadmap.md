# 08 — Roadmap

Couvre : CDC §55–57, §99–101, §121–122, §124, §133. Durées indicatives pour une
petite équipe senior ; l'ordre et les contenus sont l'engagement, pas les dates.

## Principes de découpage

- **Le MVP n'est pas jetable** (CDC §122) : chaque phase construit sur le schéma
  et les modules définis dans ce dossier.
- **20 fonctionnalités excellentes > 100 moyennes** (CDC §124) : une
  fonctionnalité entre dans une phase seulement si elle peut y être finie au sens
  de la Definition of Done (CDC §133).
- Chaque phase se termine par : load test des parcours ajoutés, revue sécurité,
  mise à jour docs + analytics.

## Phase 0 — Fondations (2–3 semaines)

Monorepo Turborepo (apps web/admin/api, packages ui/i18n/schemas/config) ·
docker-compose dev (postgres+postgis, redis, meilisearch, minio, mailpit) ·
CI/CD complet (lint→tests→build→security→staging→prod, rollback) ·
environnements + secrets · squelette NestJS (modules, event bus, BullMQ,
OpenAPI) · migrations initiales du schéma (doc 03) · observabilité (Sentry,
OTel, alertes) · **design system v1** (tokens, typo, couleurs, composants de
base — CDC §2) · i18n sq/en branchée · seeds : villes du Kosovo, taxonomie
complète (CDC §32), synonymes de recherche initiaux.

**Décisions à clore en Phase 0** : prestataire OTP SMS (risque R2), hébergement,
nom de domaine, direction artistique (logo, couleur principale).

## Phase 1 — MVP (8–10 semaines) — périmètre CDC §121

La boucle complète, excellente, rien de plus :

| Bloc | Contenu |
|---|---|
| Auth & comptes | inscription (téléphone/email/Google/Apple), OTP, profils, capacités multiples, vérifications téléphone/email |
| Publication | saisie libre + **parse IA** (catégorie/ville/date/urgence/budget) + confirmation, formulaire court fallback, photos, publique/privée, urgent, < 60 s |
| Modération | pipeline asynchrone + Risk Score + zones (D7), détection prix contextuelle v1, file de modération admin, sanctions graduées |
| Matching | pipeline complet (doc 06) : vagues, caps, poids configurables, cold start |
| Notifications | push + in-app + email, préférences, digest, quiet hours |
| Réponse & comparaison | offre structurée, comparateur d'offres, acceptation, statuts de demande |
| Messagerie | temps réel WS, read receipts, typing, pièces jointes, blocage, signalement, scan sécurité |
| Profils publics | page pro complète (stats, badges, portfolio, avis), profil particulier |
| Avis | notes + sous-notes, réponse, signalement, réputation bayésienne, anti-faux-avis v1 |
| Recherche | Meilisearch (typo, synonymes sq), filtres, onglets, tri, carte simple, DISPO TANI |
| SEO | pages programmatiques villes×catégories (avec garde-fou de contenu réel), JSON-LD, sitemap |
| Dashboards | utilisateur + pro (v1 : demandes, réponses, avis, stats de base) |
| Admin | users, requests, moderation queue, Risk Center v1, reports, verifications, categories/cities, settings (poids, seuils), analytics v1 |
| Croissance | partage de demande (lien + WhatsApp/Viber/FB), invitation de pro, favoris, saved searches |

**Gate de sortie MVP** : E2E verts sur les parcours critiques, load test 500
demandes/h, KPI instrumentés, revue sécurité, beta fermée avec pros recrutés à
Prishtinë (l'offre avant la demande — CDC §99).

## Phase 2 — Location QIRA (4–6 semaines)

Annonces de location (CDC §34), calendrier avec anti-chevauchement (CDC §35),
demandes de location inversées (CDC §36), réservation avec statuts (CDC §37,
sans paiement), recherche/carte/SEO location, modération adaptée (prix location).

## Phase 3 — Outils professionnels (4–6 semaines)

Devis (CDC §39), factures + PDF (CDC §40), mini-CRM (CDC §41), dashboard pro
complet (CDC §42), calendrier pro, entreprises multi-employés avec rôles
(CDC §44), B2B `pro_only` (CDC §43), vérification entreprise assistée (CDC §96).

## Phase 4 — Paiements (quand un PSP est validé pour le Kosovo)

Implémentation du premier `PaymentProvider` : caution de location, acompte,
remboursements, annulations (CDC §38). Aucune commission obligatoire (CDC §58).
Peut glisser sans bloquer le reste — le produit vit sans paiement pendant la
phase gratuite.

## Phase 5 — IA avancée & apps (continu)

Assistant « Pyet AlloPuno » et estimation « Sa kushton? » sur données réelles
suffisantes, jamais de prix inventé (CDC §79–80) · recherche sémantique ·
suggestions de description · app mobile Expo (iOS/Android) sur l'API existante
(CDC §68) · rapport de pouvoir prédictif du matching → ajustement des poids.

## Trajectoire business (rappel, CDC §99–101)

- **Année 1** — gratuit. Villes : Prishtinë, Fushë Kosovë, Ferizaj, Gjilan,
  Prizren. Recrutement actif de pros avant l'ouverture grand public. KPI nord :
  % de demandes avec ≥1 réponse pertinente.
- **Année 2** — gratuit. Expansion Pejë, Gjakovë, Mitrovicë puis tout le Kosovo.
  Marque, SEO, partenariats. Mesure de la valeur par fonctionnalité (CDC §56).
- **Année 3+** — monétisation progressive : FREE/PRO/PRO+/BOOST (plans déjà en
  base, feature flags), particuliers gratuits autant que possible, monétisation
  côté pros/entreprises (CDC §57–58). Aucun changement d'architecture requis.

## Definition of Done (CDC §133 — rappel opérationnel)

Fonctionnelle · responsive · testée (unit+intégration+E2E du parcours) ·
sécurisée (authz + validation + revue) · documentée · branchée analytics ·
compatible mobile · compatible rôles · gérée côté admin · erreurs gérées ·
prête pour la montée en charge. Une PR qui ne coche pas tout ne ferme pas la
fonctionnalité.
