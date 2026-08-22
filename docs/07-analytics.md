# 07 — Analytics

Couvre : CDC §55–56, §59–62, §102, §133.

## 1. Architecture

```
apps (web/admin/api) → track() → queue `analytics` → analytics_events (partitionnée)
                                        │
                     jobs d'agrégation (horaire/quotidien)
                                        ▼
                     tables d'agrégats (metrics_daily, metrics_city_daily,
                     metrics_category_daily, cohorts) → dashboards admin
```

- **Événements produits côté serveur** pour tout ce qui compte (publication,
  réponse, acceptation…) : fiables, non bloqués par les adblockers. Le client
  n'envoie que la navigation (pages, recherches) — soumise au consentement
  (doc 05 §11).
- Chaque événement : `event`, `user_id`/`anonymous_id`, `city_id`,
  `category_id`, `properties`, horodatage. PII interdite dans `properties`.
- Definition of Done (CDC §133) : une fonctionnalité n'est terminée que si ses
  événements analytics sont émis et visibles en dashboard.
- À grande échelle : export des partitions vers un entrepôt (ClickHouse/BigQuery)
  sans changer l'instrumentation.

## 2. Taxonomie d'événements (extrait fondateur)

```
auth:      user.signed_up (méthode), user.verified (type)
request:   request.parse_used, request.published (kind, urgent, via_ai),
           request.first_offer_received (delay_s), request.matched,
           request.completed, request.cancelled (par qui), request.expired_unanswered
matching:  match.notified (score, vague), match.opened, match.responded (delay_s)
offer:     offer.created (completeness), offer.accepted, offer.declined
messaging: conversation.started, message.sent
review:    review.submitted (rating, verified)
pro:       pro.onboarded, pro.available_now_toggled, pro.alerts_configured
rental*:   rental.published, booking.requested/confirmed/completed   (*Phase 2)
growth:    share.clicked (canal), invite.sent, invite.converted, saved_search.created
trust:     report.submitted, sanction.applied, moderation.blocked, moderation.false_positive
```

## 3. KPIs (CDC §59–60, §102)

### KPI nord (affiché en premier partout)
**% de demandes recevant ≥ 1 réponse pertinente** (pertinente = offre avec prix
ou disponibilité, d'un pro non sanctionné). Cible de lancement : > 80 % sur les
villes actives.

### KPIs secondaires ordonnés
1. Temps médian avant première réponse.
2. % de demandes → prestation (`request.completed`).

### Tableau de bord général
MAU/DAU, nouveaux utilisateurs, pros actifs (≥1 réponse/30 j), demandes,
réponses, taux de réponse, taux de sélection (offre acceptée / demandes avec
offres), taux de complétion, taux d'avis, rétention (D1/D7/D30), cohortes
hebdomadaires, temps de réponse par percentile.

## 4. Dashboards par ville (CDC §61)

Pour chaque ville active (Prishtinë, Prizren, Ferizaj, Gjilan, Pejë, Gjakovë,
Mitrovicë…) : utilisateurs, pros actifs, demandes, réponses, taux de réponse,
temps de réponse, catégories en tension (demande sans offre). C'est l'outil de
pilotage de l'expansion géographique (CDC §99–100).

## 5. Dashboards par catégorie (CDC §62)

Par catégorie (et catégorie × ville) : demandes, réponses, taux de réponse,
temps de réponse, pros actifs, **gap d'offre** (demandes non servies) → liste
priorisée « où recruter des professionnels », directement actionnable par
l'équipe commerciale.

## 6. Année 2 : mesurer la valeur (CDC §56)

Instrumentation prête pour répondre à : quelles fonctionnalités créent la
conversion (parse IA vs formulaire, comparateur, alertes) ; quels pros répondent
le plus et à quoi ; quelles catégories performent ; % de clients obtenant une
prestation. A/B testing léger par feature flags (`settings`) pour tester des
fonctionnalités premium **sans paywall** pendant la phase gratuite.
