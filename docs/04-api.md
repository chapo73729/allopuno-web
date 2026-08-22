# 04 — Structure API

Couvre : CDC §74–75, §114. REST versionnée sous `/api/v1`, documentée en OpenAPI
(générée depuis les schémas Zod de `packages/schemas`). WebSocket pour le temps
réel. `/api/v2` = nouveau routeur le jour venu, jamais de breaking change dans v1.

## 1. Conventions

- **Auth** : `Authorization: Bearer <access JWT>` (15 min) + refresh token rotatif
  (httpOnly cookie sur web, secure storage sur mobile). Détail doc 05.
- **Format** : JSON ; erreurs normalisées
  `{ "error": { "code": "REQUEST_NOT_FOUND", "message": "...", "details": {} } }`
  avec codes stables (les clients traduisent, le serveur ne renvoie pas de texte UI).
- **Pagination** : par curseur — `?cursor=...&limit=20` →
  `{ data, next_cursor }`. Jamais d'offset sur les tables de faits.
- **Idempotence** : header `Idempotency-Key` accepté sur les POST sensibles
  (offres, bookings, paiements futurs).
- **Rate limiting** : par IP + par utilisateur + par route sensible (doc 05 §5),
  réponses `429` avec `Retry-After`.
- **i18n** : `Accept-Language` (sq par défaut) pour les contenus multilingues
  (catégories, CMS) ; l'UI ne reçoit que des données, pas de phrases.
- **Locale des montants** : toujours `amount_cents` + `currency` ; le client formate.

## 2. Endpoints par module

Liste de conception (les DTOs précis vivront dans `packages/schemas` / OpenAPI).
🔒 = authentifié · 👔 = profil pro requis · 🛡 = rôle admin.

### Auth (`/api/v1/auth`)
```
POST /register                 email ou téléphone
POST /otp/send | /otp/verify   OTP SMS (login/vérification téléphone)
POST /login                    email+password
POST /oauth/{google|apple}     échange de token OAuth
POST /refresh · POST /logout
POST /password/forgot · /password/reset
GET  /me 🔒                    identité + capacités + vérifications
```

### Users & profils (`/api/v1/users`, `/profiles`)
```
GET    /profiles/{id}                  profil public particulier (CDC §21)
PATCH  /me/profile 🔒
GET    /me/settings 🔒 · PATCH /me/settings 🔒     privacy, notifications
POST   /me/verifications 🔒            démarrer une vérification (type)
GET    /me/verifications 🔒
POST   /me/data-requests 🔒            export / suppression (CDC §113)
DELETE /me 🔒                          suppression de compte
POST   /users/{id}/block 🔒 · /users/{id}/report 🔒
```

### Professionnels (`/api/v1/professionals`)
```
GET    /professionals                  recherche/liste (filtres CDC §50)
GET    /professionals/{id}             page pro publique (CDC §22)
GET    /professionals/{id}/reviews
POST   /me/professional 🔒             activer la capacité pro (onboarding §95)
PATCH  /me/professional 👔             profil, zone, rayon, description
PUT    /me/professional/services 👔    catégories + tarifs indicatifs
PUT    /me/professional/alerts 👔      préférences d'alerte (CDC §17–18)
POST   /me/professional/available-now 👔   DISPO TANI on/off (CDC §31)
POST   /me/professional/portfolio 👔 · DELETE .../{itemId} 👔
```

### Entreprises (`/api/v1/businesses`)
```
POST /businesses 🔒 · GET /businesses/{id} · PATCH /businesses/{id} 👔(admin)
POST /businesses/{id}/members 👔(admin)    inviter, rôle admin/manager/technician
PATCH|DELETE /businesses/{id}/members/{userId} 👔(admin)
```

### Catégories & référentiels (`/api/v1`)
```
GET /categories?kind=service|rental    arbre complet (cache long)
GET /cities · GET /cities/{id}/zones
```

### Demandes (`/api/v1/requests`)
```
POST   /requests/parse 🔒              NLU : texte libre → champs proposés (CDC §9, §11)
POST   /requests 🔒                    créer (draft ou publier)
GET    /requests                       flux public filtré (géo, catégorie…)
GET    /requests/{id}                  détail (respecte visibility/audience)
PATCH  /requests/{id} 🔒(owner)        modifier, annuler, marquer complétée
POST   /requests/{id}/images 🔒(owner)
GET    /requests/{id}/offers 🔒(owner) offres reçues + données de comparaison (CDC §20)
POST   /requests/{id}/share 🔒         lien de partage (CDC §104)
POST   /requests/{id}/invite 🔒        invitation pro externe (CDC §105)
GET    /me/requests 🔒
GET    /me/matched-requests 👔         flux de demandes matchées côté pro
```

### Offres (`/api/v1/offers`)
```
POST  /requests/{id}/offers 👔         réponse structurée (CDC §19)
PATCH /offers/{id} 👔(owner)           modifier / retirer
POST  /offers/{id}/accept 🔒(demandeur)   → matched + notifications
POST  /offers/{id}/decline 🔒(demandeur)
GET   /me/offers 👔
```

### Messagerie (`/api/v1/conversations` + WebSocket)
```
GET  /conversations 🔒 · GET /conversations/{id}/messages 🔒 (curseur)
POST /conversations/{id}/messages 🔒   (fallback REST du WS)
POST /conversations/{id}/read 🔒
POST /conversations/{id}/block 🔒 · /report 🔒
WS   /ws  events: message.new, message.read, typing, presence,
                  conversation.updated, notification.new
```

### Avis (`/api/v1/reviews`)
```
POST /reviews 🔒          lié à une demande/booking éligible (CDC §26)
POST /reviews/{id}/reply 🔒(sujet de l'avis)
POST /reviews/{id}/report 🔒
```

### Location — Phase 2 (`/api/v1/rentals`, `/bookings`)
```
POST/GET/PATCH /rentals …              annonces (CDC §34)
GET  /rentals/{id}/availability · PUT 🔒(owner)   calendrier (CDC §35)
POST /rentals/{id}/bookings 🔒         demande de réservation (CDC §37)
POST /bookings/{id}/{confirm|cancel|return} 🔒 (selon rôle)
```

### Devis & factures — Phase 3 (`/api/v1/quotes`, `/invoices`)
```
POST/GET/PATCH /quotes 👔 · POST /quotes/{id}/send 👔
POST /quotes/{id}/{accept|decline|request-revision} 🔒(client)
POST/GET /invoices 👔 · POST /invoices/{id}/send 👔 · GET /invoices/{id}/pdf
```

### Recherche & découverte (`/api/v1/search`)
```
GET /search?q=&type=&filters…          onglets pros/demandes/locations/services (CDC §8)
GET /search/suggest?q=                 autocomplete + détection d'intention IA
GET /map?bbox=&type=&filters…          données carte, positions approximées (CDC §30)
```

### Engagement (`/api/v1`)
```
POST/DELETE /favorites 🔒 · GET /me/favorites 🔒
POST/GET/PATCH/DELETE /me/saved-searches 🔒     (CDC §52)
GET /me/notifications 🔒 · POST /me/notifications/read 🔒
PUT /me/notification-preferences 🔒
POST /me/devices 🔒                    enregistrement push token
```

### Signalements & support (`/api/v1`)
```
POST /reports 🔒                       cible + motif (CDC §48)
POST /support/tickets 🔒 · GET /me/support/tickets 🔒
GET  /cms/pages/{slug} · GET /cms/faq  contenu public (CDC §82)
```

### Admin (`/api/v1/admin`) 🛡 — permissions par rôle (CDC §88)
```
GET/PATCH /admin/users · POST /admin/users/{id}/sanctions      (CDC §49)
GET /admin/moderation/queue · POST /admin/moderation/{id}/decision
GET /admin/risk/events · GET /admin/risk/accounts/{id}         Risk Center (CDC §46)
GET/PATCH /admin/reports
GET /admin/verifications · POST /admin/verifications/{id}/decision
CRUD /admin/categories · /admin/cities · /admin/cms
GET/PUT /admin/settings/{key}          poids matching, seuils, flags (CDC §16)
GET /admin/analytics/{overview|cities|categories}              (CDC §59–62)
CRUD /admin/plans · GET /admin/subscriptions                   (dormant)
GET /admin/audit-logs
```

## 3. Webhooks & API partenaires (CDC §114)

Prévu, non exposé au lancement : espace `/api/partner/v1` séparé avec API keys
scopées + webhooks sortants signés (`booking.confirmed`, `request.published`…).
L'architecture (auth par clé, scopes, rate limits dédiés) est posée dès le MVP
mais fermée.

## 4. Documentation

- OpenAPI 3.1 générée en CI, publiée sur l'environnement staging
  (`/api/docs`, protégée en prod).
- Chaque module documente ses événements de domaine (nom, payload, consommateurs)
  dans `docs/events.md` (maintenu à partir du code).
