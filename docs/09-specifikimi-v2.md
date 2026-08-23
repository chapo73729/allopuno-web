# 09 — Spécification v2 (request-first) — synthèse et deltas

Reçue en août 2026 (v1.0, 129 sections, écrans 001–060). Elle précise et durcit le
cahier des charges initial. **La v2 fait foi sur le parcours produit.** Ce document
enregistre les décisions et les écarts vs l'existant ; le texte intégral est chez
le propriétaire produit.

## Priorité absolue (§129)

Le site actuel = maquette fonctionnelle insuffisante. À refaire en premier :

1. **ACCUEIL** — question centrale « De quoi avez-vous besoin ? », localisation
   discrète, « comment ça marche », services populaires, meilleurs pros, CTA pro.
2. **CRÉATION DE DEMANDE** — écrans 007→016 en étapes distinctes :
   description libre → compréhension IA (confiance <0.70 ⇒ confirmation) →
   catégorie → localisation → date → budget (jamais bloquant) → photos (≤10) →
   résumé → publication (animation matching) → publiée.
3. **PARCOURS DEMANDE → RÉPONSES → MESSAGERIE** — ma demande (017), feed
   prestataire (019–021), réponses client (022), comparateur (023), profil (024),
   conversations (026–027) avec bloc demande + actions (RDV, devis, paiement).

## Navigation (§2.2)

Mobile : barre basse **Accueil · Demandes · Messages · Notifications · Profil**.
Desktop : header logo/nav + « Publier une demande » + profil.

## Deltas notables vs v1

- **Langues initiales : sq, sr, en** (le serbe s'ajoute — puis de, fr). Catalogues
  et `category_translations` par langue.
- Accueil **connecté** différencié client (mes demandes/réponses/RDV) vs
  prestataire (nouvelles demandes, réponses, RDV, revenus).
- Choix d'activité à l'onboarding (chercher / proposer / les deux) — ne verrouille
  jamais le compte.
- Cycle complet transactionnel : RDV (PROPOSED→…), devis (DRAFT→…EXPIRED),
  paiement acompte/solde **confirmé uniquement par webhook**, litiges, payouts.
- IA jamais source unique de vérité : `confidence < 0.70 ⇒ confirmation humaine`.
- Adresse exacte masquée avant interaction suffisante ; permissions serveur
  centralisées (authenticate/authorize/checkOwnership/…).
- Événements bus exhaustifs (USER_CREATED … REVIEW_CREATED), idempotence
  obligatoire (webhooks, paiements).
- KPI n°1 inchangé : **% de demandes recevant ≥1 réponse**.
- Ordre de dev en 8 sprints (§127) ; MVP §121 = 18 briques ; critère final §128 =
  scénario bout-en-bout traçable backend.

## Alignement architecture existante

Le dossier `docs/00–08` reste valide (mêmes principes : modular monolith,
PostgreSQL+PostGIS, Redis, queues, matching pondéré, modération contextuelle).
La v2 ajoute/précise : tables `appointments`, `quotes/quote_items`,
`transactions/payments/payouts`, `disputes`, `category_translations`,
`service_areas`, `provider_availability` — à fusionner dans `schema.sql` lors du
chantier backend.

## État d'implémentation (frontend actuel)

En attendant le backend, le parcours §129 est implémenté **côté client** avec un
moteur local (`apps/web/src/lib/engine/`) : demandes persistées (localStorage),
matching/réponses simulés sur les données démo, messagerie locale avec réponses
simulées, notifications. Les types du moteur suivent les contrats API
(`docs/04-api.md`) pour que le branchement backend soit mécanique.
