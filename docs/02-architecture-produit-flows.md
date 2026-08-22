# 02 — Architecture produit & flows

Couvre : CDC §1–11, §14–23, §26–27, §29–37, §39–44, §50–52, §63, §81–88, §95,
§103–112, §121, §123, §128.

## 1. Modèle d'utilisateurs et de rôles (CDC §4, §44)

**Un compte = une identité, plusieurs capacités.** On ne crée jamais un second
compte pour une seconde activité.

```
users (identité, auth, statut, risque)
 ├── profiles (profil "particulier" — toujours présent)
 ├── professional_profiles (0..1 — activé quand l'utilisateur propose des services)
 │     └── professional_services (catégories proposées, zone, rayon, tarifs indicatifs)
 ├── rentals (0..n — annonces de location, activables par n'importe quel compte)
 └── business_members (0..n — appartenance à des entreprises, avec rôle)
       └── businesses (compte entreprise : légal, vérification, employés)
```

- Les « types » du CDC (particulier, professionnel, entreprise, loueur,
  prestataire) sont des **capacités activables**, pas des types de compte rigides.
- Entreprise (CDC §44) : compte principal + membres avec rôles `admin`,
  `manager`, `technician` ; chaque employé garde son propre login.
- B2B (CDC §43) : une demande peut être marquée `audience = pro_only` — seuls les
  comptes avec profil professionnel actif la voient et la reçoivent.

## 2. Parcours d'entrée

### 2.1 Inscription & authentification (CDC §5)

Voies : téléphone (OTP SMS), email (+ mot de passe ou magic link), Google, Apple.
La vérification du téléphone est exigée **au moment de la première action qui la
requiert** (publier une demande, répondre à une demande), pas à l'inscription —
friction minimale, sécurité au bon endroit.

### 2.2 Onboarding (CDC §6, §95)

Trois écrans maximum, tous passables (« Kalo » / skip) :

1. Ville + zone (liste kosovare, geoloc en option).
2. « Que veux-tu faire ? » — chercher des services / en proposer / les deux.
3. Si « proposer » : catégories, zone d'intervention, rayon → crée le
   `professional_profile` et enchaîne sur l'onboarding pro (portfolio, tarifs
   indicatifs, description, vérifications — CDC §95).

Tout ce qui est passé est redemandé contextuellement plus tard. Le système
apprend des actions (villes recherchées, catégories consultées).

## 3. Page d'accueil (CDC §7)

Mobile first. Dans l'ordre : logo + menu → H1 **« Çfarë të duhet? »** → barre
« Shkruaj çfarë të duhet... » avec exemples dynamiques rotatifs → CTA
**PUBLIKO KËRKESËN** → catégories principales → sections « Kërkesa pranë teje »,
« Profesionalët pranë teje », « Shërbimet më të kërkuara », « Qira pranë teje »
(alimentées par la géolocalisation approximative ou la ville déclarée).

## 4. Le flow cœur : demande → prestation

### 4.1 Publication d'une demande (CDC §9–11, §107, §123) — objectif < 60 s

```
[Saisie libre] "Më duhet një hidraulik në Prishtinë nesër"
      │  (frappe → suggestion en direct ; envoi → AIService.extractRequestFields)
      ▼
[Écran de confirmation pré-rempli]
  Kategoria: Hidraulik ✎     Qyteti: Prishtinë ✎     Data: nesër ✎
  + photos (option) · budget (option) · urgent (toggle) · publike/private
      │  L'IA ne demande QUE les champs réellement manquants et nécessaires
      │  (ex. peintre → surface approximative). Jamais 15 champs. (CDC §107)
      ▼
[PUBLIKO KËRKESËN]
      ▼
status=pending_moderation → Risk Engine (asynchrone, < quelques secondes)
  score ≤ 20  → published (cas nominal, quasi instantané)
  21–60      → published avec contrôles renforcés OU demande de précision
  ≥ 61       → bloqué → file de modération humaine
      ▼
request.published → Matching Engine → notifications aux pros pertinents (doc 06)
```

Si l'IA échoue ou si l'utilisateur préfère : formulaire court classique en 8
étapes (CDC §10), chaque étape optionnelle étant réellement optionnelle.

**Demande privée (CDC §15)** : depuis une recherche de professionnels,
l'utilisateur en sélectionne un ou plusieurs → même formulaire → diffusion
limitée aux destinataires choisis (`request_recipients`).

### 4.2 Réponse du professionnel (CDC §17, §19, §108)

Notification push « NOUVELLE DEMANDE — Elektricist — Prishtinë — 3,2 km — Budget
100–200 € — Demain — [RÉPONDRE] ». La réponse est **structurée** : prix (ou
fourchette + unité), disponibilité, durée estimée, message, photos, conditions.
Les réponses complètes sont favorisées dans l'ordre d'affichage ; les réponses
vides de contenu descendent (CDC §108). Répondre crée l'offre **et** la
conversation associée.

### 4.3 Comparaison & choix (CDC §20)

Écran « KRAHASO OFERTAT » : cartes côte à côte (nom, photo, prix, distance, note,
nb d'avis, temps/taux de réponse, badges de vérification, disponibilité, lien
portfolio). Badges factuels calculés : « Më i afërti » (plus proche), « Nota më e
lartë », « Më i disponueshëm », « Raport i mirë çmim/cilësi » — **le système
n'accepte jamais l'offre à la place du client.** Choisir = `offer.accepted` →
les autres offrants sont notifiés proprement, la demande passe `matched`.

### 4.4 Prestation, statuts, annulation (CDC §37, §111)

Cycle demande : `published → matched → in_progress → completed | cancelled |
expired`. Les annulations sont typées (client / pro / no-show), historisées et
alimentent le ranking dynamique — sans sanction automatique hors contexte
(CDC §111).

### 4.5 Avis & réputation (CDC §25–26)

À `completed` : notification « SI SHKOI PUNA? » → note globale 1–5 + sous-notes
(qualité, ponctualité, communication, rapport qualité/prix, professionnalisme)
+ commentaire. Un avis n'est possible que sur une interaction réelle (offre
acceptée / prestation liée). Réponse du professionnel possible, signalement
possible. Affichage : moyenne bayésienne pondérée par le volume (doc 06 §5),
sous-notes affichées seulement à partir d'un volume statistiquement pertinent.

## 5. Messagerie (CDC §27–28, §106)

Temps réel (WebSocket) : texte, photos, documents, offres/devis intégrés, statut
de prestation. Read receipts, typing, recherche, blocage, signalement. Chaque
message passe par le Risk Engine en asynchrone (spam, phishing, arnaque — doc 05).
La conversation principale reste sur AlloPuno ; WhatsApp/Viber ne servent qu'au
partage sortant (CDC §106).

## 6. Recherche (CDC §8, §50)

- **Classique** : mot-clé + filtres (catégorie, sous-catégorie, ville, zone,
  distance, prix, disponibilité, note, type, vérification) ; résultats en onglets
  Professionnels / Demandes / Locations / Services. Tris : pertinence, distance,
  note, temps de réponse, disponibilité. Sponsorisé toujours étiqueté.
- **IA** : la même barre accepte le langage naturel ; si l'intention détectée est
  un besoin (« më duhet… »), on propose directement le flow de publication
  pré-rempli (§4.1) au lieu d'une simple liste.
- **Carte (CDC §30)** : vue carte des pros/locations avec positions approximatives
  (jamais l'adresse exacte d'un domicile — doc 05 §7).

## 7. Mode urgence — DISPO TANI (CDC §31)

Le pro active « I disponueshëm tani » (avec expiration automatique). Une demande
marquée urgente ne matche que les pros disponibles maintenant dans le rayon, avec
distance, temps de réponse moyen et prix indicatif. Notifications immédiates,
sans digest.

## 8. Location — QIRA (CDC §33–37, Phase 2)

Annonce (champs CDC §34), calendrier interactif (disponible/réservé/indisponible,
prix par période — CDC §35), demandes de location inversées (« Kërkoj një
mini-eskavator për 3 ditë » — CDC §36) suivant la même boucle demande → offres →
comparaison → réservation. Statuts booking : `pending → confirmed → active →
returned → completed | cancelled | disputed`, caution et paiement prêts en schéma
mais inactifs pendant la phase gratuite.

## 9. Outils professionnels (CDC §39–42, Phases 3+)

Devis (lignes, matériaux, main-d'œuvre, taxes ; accepter/refuser/demander
modification), factures (statut, PDF, historique, relances), mini-CRM (clients,
demandes, devis, factures, prestations, calendrier, revenus), dashboard pro avec
statistiques (CDC §42, §87).

## 10. Rétention & croissance (CDC §51–52, §63, §104–105)

- Favoris (pros, annonces, locations, services).
- Recherches sauvegardées avec alertes (« Elektricist Prishtinë » → notification
  quand un nouveau pro correspond).
- Partage de chaque demande/profil/annonce : lien public court + partage
  WhatsApp/Viber/Facebook/Messenger/Instagram avec OG tags propres.
- « A njeh dikë që mund ta bëjë këtë? » sur chaque demande : invitation directe
  d'un professionnel hors plateforme (accélérateur de liquidité — CDC §105).
- Honnêteté marketplace (CDC §103) : catégorie/zone sans offre → message clair +
  « Më njofto kur dikush i bashkohet zonës ».

## 11. Dashboards

### Utilisateur (CDC §86)
Kërkesat e mia · Përgjigjet · Prestations · Locations · Favoris · Messages ·
Avis · Paramètres (privacy, notifications, export, suppression).

### Professionnel (CDC §87)
Nouvelles demandes (flux matché) · Mes réponses · Clients · Prestations ·
Calendrier · Devis · Factures · Revenus · Avis · Profil public · Statistiques
(taux/temps de réponse, conversion, nouveaux clients — CDC §42).

### Historique & visibilité (CDC §112)
Chacun voit son historique complet ; les éléments privés (budgets, messages,
adresses) ne sont visibles que par les parties concernées.

## 12. Admin flows (CDC §45–49, §81–82, §88–89)

Rôles admin : Super Admin, Admin, Moderator, Support, Finance, Content Manager —
permissions par section, chaque action sensible auditée (qui/quoi/quand/IP/objet).

| Section | Flows principaux |
|---|---|
| Users / Professionals / Businesses | recherche, fiche 360° (activité, risque, vérifications), actions graduées : warning → limitation → suspension temporaire → vérification requise → ban (CDC §49), restauration |
| Requests / Offers / Rentals / Bookings | consultation, modération, retrait motivé, republication |
| Moderation queue | file priorisée par score de risque ; approuver / demander modification / bloquer ; chaque décision entraîne le feedback du modèle de risque |
| Risk Center (CDC §46) | événements suspects centralisés : score, raisons, compte, IP, appareil, historique ; vues « multi-comptes », « pics de signalements », « prix anormaux » |
| Reviews | signalements d'avis, détection faux avis (doc 05), suppression motivée |
| Reports (CDC §48) | file de signalements par motif, SLA de traitement, lien vers l'objet signalé |
| Verifications | file de vérification identité/entreprise/documents : examiner les pièces, approuver/refuser avec motif — un badge n'existe jamais sans vérification réelle (CDC §24) |
| Categories / Cities | taxonomie éditable (libellés multilingues, synonymes de recherche, ordre, icônes), villes/zones |
| CMS (CDC §82–83) | pages, FAQ, guides SEO, bannières, conditions, notifications produit |
| Analytics | dashboards globaux, par ville, par catégorie (doc 07) |
| Settings | poids du matching, seuils de risque, caps de notifications, feature flags, plans (dormants) |
| Support (CDC §81) | tickets, FAQ, accès aux conversations **liées à un ticket uniquement** et dans le respect des règles de confidentialité |

## 13. Périmètre MVP (rappel, CDC §121)

Inscription · profils · catégories · publication de demande (IA + formulaire) ·
matching · notifications · réponse structurée · comparaison · messagerie ·
profil professionnel · avis · recherche · géolocalisation · admin · modération ·
anti-spam. — La location, la réservation, les paiements, devis/factures/CRM,
l'IA avancée et le B2B suivent dans les phases 2+ (doc 08), sur des fondations
déjà prêtes dans le schéma.
