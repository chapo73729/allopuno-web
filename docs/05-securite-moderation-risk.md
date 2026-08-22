# 05 — Sécurité, modération & risk

Couvre : CDC §5, §12–13, §24, §26, §28–29, §46–49, §71–73, §89, §94, §110–111.

## 1. Authentification (CDC §5)

- **Voies** : OTP SMS (téléphone), email + mot de passe (argon2id) ou magic link,
  OAuth Google/Apple. Architecture extensible : chaque voie est un provider
  derrière une interface commune (`auth_identities`).
- **Sessions** : access JWT courte durée (15 min, signé asymétrique) + refresh
  token **rotatif** avec détection de réutilisation (vol de token → révocation de
  la famille). Web : cookies httpOnly/secure/SameSite ; mobile : secure storage.
- **Vérifications progressives** : téléphone exigé à la première action sensible
  (publier, répondre), pas à l'inscription. Badges (téléphone, email, identité,
  entreprise, documents, assurance) uniquement après vérification réelle
  (CDC §24) — la table `verifications` est la seule source des badges.
- **OTP** : 6 chiffres, TTL 5 min, max 5 tentatives, cooldown progressif par
  téléphone **et** par IP/device (anti SMS-pumping, coût maîtrisé).

## 2. Autorisation

- **RBAC + policies.** Rôles plateforme (user, pro, rôles admin CDC §88) +
  rôles d'entreprise (admin/manager/technician, CDC §44) + **ownership** vérifié
  en base (une ressource n'est modifiable que par son propriétaire ou un rôle
  explicite).
- Implémentation : guards NestJS + couche policy centralisée
  (`can(actor, action, resource)`) testée unitairement par matrice
  rôle × action × ressource (CI bloquante — CDC §116 « security tests »).
- Le frontend masque, le backend **décide** : aucune règle d'accès uniquement
  côté client.

## 3. Sécurité applicative (CDC §73)

| Menace | Défense |
|---|---|
| Injection SQL | Prisma paramétré partout ; SQL natif uniquement paramétré et revu |
| XSS | React (échappement par défaut), aucun `dangerouslySetInnerHTML` sans sanitizer, CSP stricte, contenu utilisateur toujours traité comme texte |
| CSRF | API Bearer non concernée ; cookies web protégés SameSite + double-submit sur les routes cookie |
| Brute force | rate limiting Redis par IP/compte/route, verrouillage progressif, alertes |
| Validation | Zod sur **toutes** les entrées (body, query, params, headers), listes blanches, tailles max, upload : type MIME réel vérifié, EXIF/GPS strippé |
| Secrets | secret manager de la plateforme, rotation documentée, gitleaks en CI |
| Données sensibles | chiffrement applicatif (AES-GCM, clés gérées) pour `exact_address`, pièces de vérification ; TLS partout ; disques chiffrés |
| Dépendances | audit + renovate, images minimales, utilisateur non-root |
| Logs | jamais de PII en clair dans les logs techniques ; IP hashées dans les tables produit |

## 4. Pipeline de modération (CDC §12)

Chaque contenu (demande, annonce, message, avis, image, profil) passe en
**asynchrone** par le moteur de modération, qui produit un score 0–100 :

```
contenu → [règles rapides] → [heuristiques prix/comportement] → [IA (texte, image)]
        → score + raisons → risk_events
score ≤ 20   → publié automatiquement (cas nominal : quasi-instantané)
score 21–60  → publié avec contrôle renforcé OU demande de précision ;
               échantillonné vers la revue humaine
score ≥ 61   → bloqué → file de modération humaine priorisée
```

Signaux : texte (spam, arnaque, contenu interdit, répétition), images (contenu
interdit — CDC §93), prix (cf. §5), historique et réputation de l'auteur,
vélocité (n publications/heure), device/IP partagés, patterns de manipulation.

**Anti-faux-positifs (CDC §12, §125)** : les décisions humaines alimentent le
réglage des seuils ; le Risk Center suit le taux de faux positifs comme KPI ; en
zone grise on privilégie « publier + surveiller » ou « demander une précision »
plutôt que bloquer.

## 5. Détection de prix contextuelle (CDC §13)

Jamais de règle rigide « prix bas = fraude ». Le signal est l'**écart à la
distribution de référence** :

- `price_benchmarks` : percentiles p10/p50/p90 par catégorie × ville × unité,
  recalculés par job à partir des annonces/offres légitimes (échantillon minimal
  requis ; sinon fallback sur la catégorie parente ou nationale).
- Score de risque prix = f(écart au p50, valeur absolue du bien, catégorie,
  historique de l'auteur). « Toyota Land Cruiser 2020 – 1 € » → écart énorme sur
  une catégorie à forte valeur → risque élevé ; « chaise – 1 € » → normal.
- Sortie graduée : rien / avertissement à l'auteur (« ce prix semble inhabituel ») /
  contrôle renforcé / blocage + revue.

## 6. Sécurité de la messagerie (CDC §28)

Scan asynchrone de chaque message : phishing, liens suspects (réputation de
domaine), tentatives de paiement hors plateforme, messages automatisés
(similarité + cadence), arnaques connues. Réponses graduées : marquer /
avertir le destinataire (« méfiez-vous des paiements hors plateforme ») /
masquer + revue / sanction. **Pas de blocage automatique des numéros de
téléphone** : le partage de contact est légitime sur une marketplace locale —
seul le contexte (score global, répétition, signalements) déclenche une action.

## 7. Privacy & géolocalisation (CDC §29–30, §71)

- Adresse exacte jamais publique : position arrondie (~300 m) pour l'affichage
  et la carte ; adresse révélée après acceptation selon la catégorie.
- Jamais affichés publiquement : numéro personnel sans consentement, documents,
  informations sensibles.
- Paramètres : privacy settings, blocage, signalement, suppression de compte,
  export des données (CDC §71, §113).

## 8. Anti-fraude & anti-manipulation (CDC §26, §47, §110)

- **Multi-comptes** : corrélation devices (`fingerprint_hash` salé, conforme
  privacy), IP hashées, patterns d'inscription ; vue « comptes liés » dans le
  Risk Center.
- **Faux avis** : avis liés à une interaction réelle (`verified_interaction`),
  détection comptes liés auteur/sujet, répétitivité, mêmes devices/IP, rafales.
- **Manipulation de ranking** : auto-réponses, fausses demandes, faux clics →
  signaux d'anomalie statistique (taux improbables) → gel du gain de réputation +
  revue.
- **Audit log complet (CDC §89)** : toute action sensible (admin et système) dans
  `audit_logs` : qui, quoi, quand, IP, objet. Immuable (append-only), consultable
  en admin.

## 9. Sanctions graduées (CDC §49, §111)

`warning → limitation → temporary_suspension → verification_required →
permanent_ban`, appliquées manuellement (admin) ou automatiquement (règles
configurables dans `settings`), toujours motivées, historisées, révocables, et
notifiées à l'utilisateur avec voie de recours (ticket support). Les annulations
et no-shows (CDC §111) nourrissent le ranking dynamique, pas de sanction
automatique sans contexte.

## 10. Anti-spam produit (CDC §94)

Rate limiting par action (publications/jour, messages/heure, signalements/jour)
avec quotas progressifs selon ancienneté et réputation ; captcha uniquement sur
signaux suspects (jamais systématique) ; détection comportementale (cadence,
similarité) via le pipeline de modération.

## 11. RGPD / protection des données (CDC §72)

Le Kosovo n'est pas dans l'UE mais l'architecture vise la compatibilité RGPD
(expansion européenne prévue) :

- **Consentement** par finalité (`consents`) : marketing, analytics non
  essentiels — jamais de consentement groupé forcé.
- **Droits** : export (`data_requests` → archive), suppression (soft-delete puis
  anonymisation par job : contenus conservés anonymisés là où l'intégrité
  transactionnelle l'exige, PII purgée).
- **Rétention** (configurable, valeurs initiales) : messages 3 ans après dernière
  activité, logs techniques 90 j, risk_events 2 ans, audit_logs 5 ans, pièces de
  vérification purgées après décision, OTP quelques minutes.
- **Minimisation** : IP/fingerprints hashés, EXIF strippé, collecte limitée au
  nécessaire.
- Les exigences précises (mentions, DPO, transferts) seront validées par conseil
  juridique (CDC §72) — l'architecture n'impose aucun blocage.

## 12. Résilience (CDC §90–91)

Backups automatiques + PITR, test de restauration trimestriel documenté, runbook
d'incident (qui, quoi, communication), monitoring et alertes (doc 01 §8),
plan de reprise : RPO ≤ 15 min, RTO ≤ 4 h en cible MVP.
