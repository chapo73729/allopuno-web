# 06 — Moteur de matching & notifications

Couvre : CDC §14, §16–18, §25, §31, §53, §97, §108–110.

## 1. Principes

1. **Ne jamais tout envoyer à tout le monde** (CDC §14) : une demande atteint un
   ensemble restreint de professionnels pertinents.
2. **Poids configurables** en admin (`settings['matching.weights']`), sans
   déploiement (CDC §16).
3. **Ranking honnête** (CDC §16, §97) : le score organique ne contient aucun
   facteur payant ; le sponsorisé (futur) est un emplacement séparé, étiqueté.
4. **Apprendre avec les données** : chaque diffusion est tracée
   (`request_matches.score_factors`) → on peut mesurer quels facteurs prédisent
   une réponse acceptée et ajuster les poids.

## 2. Pipeline de matching (à `request.published`)

```
1. CANDIDATS   (SQL/PostGIS)
   pros actifs, non sanctionnés, catégorie ∈ services du pro,
   ST_DWithin(base_location, request.location, service_radius_km),
   audience respectée (pro_only → pros vérifiés), demande privée → destinataires choisis
2. FILTRES
   préférences d'alerte du pro (catégories, rayon propre, quiet hours),
   urgence → available_now uniquement (CDC §31),
   caps anti-spam (cf. §4)
3. SCORING    score = Σ wᵢ·fᵢ  (fᵢ ∈ [0,1])
4. SÉLECTION  top-N (N configurable par catégorie, défaut 15),
   vagues progressives (cf. §3)
5. NOTIFICATION  push structuré + entrée dans le flux "Nouvelles demandes"
```

### Facteurs et poids initiaux (CDC §16)

| Facteur | Poids | Calcul (normalisé 0–1) |
|---|---|---|
| Catégorie | 25 % | 1 si sous-catégorie exacte, 0,7 si catégorie parente |
| Distance | 20 % | décroissance linéaire jusqu'au rayon d'intervention |
| Disponibilité | 15 % | available_now / calendrier / activité récente à la date demandée |
| Réputation | 15 % | score bayésien (cf. §5) |
| Temps de réponse | 10 % | percentile inversé du temps médian de réponse |
| Taux de réponse | 5 % | réponses / demandes notifiées (fenêtre 90 j) |
| Historique de prestations | 5 % | prestations complétées, saturé (log) |
| Pertinence | 5 % | similarité texte demande ↔ services/description du pro (Meilisearch, plus tard embeddings) |

**Cold start** : un nouveau pro sans historique reçoit des valeurs neutres (0,5)
sur réputation/réponse pendant ses 10 premières diffusions — sinon aucun nouveau
n'émerge jamais.

## 3. Diffusion en vagues

Pour maximiser le KPI nord (% de demandes avec ≥1 réponse pertinente — CDC §60)
sans spammer :

- **Vague 1** (t0) : top 5–8 scores.
- **Vague 2** (t0 + 30 min, si < 2 réponses) : scores suivants.
- **Vague 3** (t0 + 2 h, si toujours < 2 réponses) : élargissement du rayon
  (+50 %) et/ou catégorie parente.
- Urgent (« DISPO TANI ») : une seule vague immédiate, pros disponibles
  maintenant, délais raccourcis.
- Aucune offre après la vague 3 → honnêteté marketplace (CDC §103) : message au
  demandeur + « Më njofto » + suggestion d'inviter un pro (CDC §105) ; la
  catégorie×ville est signalée au dashboard d'acquisition (où recruter — CDC §62).

## 4. Notifications intelligentes (CDC §18, §53)

- **Caps par pro** : max K pushes de demandes/jour (défaut 10, configurable),
  au-delà → digest ; quiet hours respectées (sauf urgence si opt-in).
- **Regroupement** : n demandes similaires même zone/fenêtre → une notification
  groupée (« 4 demandes elektricist près de toi ») via `grouped_key`.
- **Modes** par pro : `immediate` / `digest` (résumé 2×/jour) / `silent`
  (flux in-app seulement).
- **Canaux** : push (FCM/WebPush) prioritaire, email en repli/résumé, SMS plus
  tard. Préférences par type × canal (`notification_preferences`).
- **Types** (CDC §53) : demande publiée, nouvelle demande correspondante,
  nouvelle réponse, message, offre acceptée, rappel, réservation, avis, sécurité,
  saved-search (« nouveau pro correspond à ta recherche » — CDC §52).
- Tout envoi passe par la queue `notifications` (retry, déduplication,
  journalisation dans `notifications`).

## 5. Réputation pondérée (CDC §25)

Affichage et facteur de matching utilisent une **moyenne bayésienne** :

```
score = (v·R + m·C) / (v + m)
  v = nombre d'avis du pro, R = sa moyenne,
  C = moyenne globale de la catégorie, m = poids de lissage (défaut 10, configurable)
```

→ 1 avis à 5★ (score ≈ C+ε) ne dépasse jamais 200 avis à 4,9. Sous-notes
(qualité, ponctualité, communication, prix, professionnalisme) affichées à partir
de n ≥ 5. Seuls les avis `verified_interaction` comptent dans le facteur de
matching.

## 6. Ranking dynamique (CDC §108–110)

Signaux continus intégrés aux facteurs :

- **Récompensés** : réponses rapides et complètes (prix + dispo + délai —
  `completeness_score`), offres acceptées, prestations complétées, bons avis.
- **Pénalisés** : annulations répétées après acceptation, no-shows, réponses
  vides, signalements confirmés. (`cancellation_rate` dans le score de
  disponibilité/réputation.)
- **Anti-manipulation** (CDC §110) : anomalies statistiques (taux de réponse ou
  d'avis improbables, auto-réponses, demandes fantômes) → gel du gain de score +
  événement Risk Center (doc 05 §8). Jamais de pénalité automatique définitive
  sans revue.

## 7. Boucle d'apprentissage

Chaque `request_matches` relie score prédictif et issue réelle (vu / répondu /
accepté). Un job hebdomadaire produit le rapport « pouvoir prédictif par
facteur » dans l'admin ; l'ajustement des poids reste **une décision humaine**
via `settings` (pas d'auto-tuning opaque — cohérent avec « ranking opaque » dans
la liste des choses à éviter, CDC §125). Une évolution vers un modèle appris
pourra être testée en A/B plus tard, avec les mêmes contraintes de transparence.
