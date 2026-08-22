# ALLOPUNO

**Çfarë të duhet?** — Marketplace locale de services, location et demandes pour le Kosovo.

> KËRKO. OFRO. GJEJ. PUNO.

ALLOPUNO est une plateforme de mise en relation : une personne décrit ce dont elle a
besoin, et les personnes capables d'y répondre — professionnels comme particuliers —
viennent à elle.

**Boucle fondamentale :**

```
DEMANDE → DIFFUSION INTELLIGENTE → RÉPONSES → COMPARAISON → CHOIX
        → MESSAGERIE → PRESTATION → AVIS → RÉPUTATION
```

## État du projet

**Phase actuelle : Architecture (Phase 0).**
Le développement du MVP ne démarre qu'après validation du dossier d'architecture.

| Jalons | Statut |
|---|---|
| Cahier des charges produit | ✅ Reçu (v1, 134 sections) |
| Dossier d'architecture | ✅ Rédigé — en attente de validation |
| MVP (Phase 1) | ⏳ Après validation |

## Dossier d'architecture

Tout est dans [`docs/`](docs/README.md) :

| Document | Contenu |
|---|---|
| [00 — Synthèse & décisions](docs/00-synthese-decisions.md) | Résumé exécutif, décisions structurantes, risques |
| [01 — Architecture technique](docs/01-architecture-technique.md) | Stack, monorepo, infra, scalabilité, environnements, CI/CD |
| [02 — Architecture produit & flows](docs/02-architecture-produit-flows.md) | Modules produit, user flows, admin flows |
| [03 — Base de données](docs/03-database.md) + [`schema.sql`](docs/schema.sql) | Modèle de données complet, DDL PostgreSQL, index |
| [04 — API](docs/04-api.md) | Structure `/api/v1`, endpoints par module, conventions |
| [05 — Sécurité, modération & risk](docs/05-securite-moderation-risk.md) | AuthN/AuthZ, Risk Engine, anti-fraude, privacy/RGPD |
| [06 — Matching & notifications](docs/06-matching-notifications.md) | Moteur de matching, ranking dynamique, notifications intelligentes |
| [07 — Analytics](docs/07-analytics.md) | Taxonomie d'événements, KPIs, dashboards ville/catégorie |
| [08 — Roadmap](docs/08-roadmap.md) | Plan par phases, périmètre MVP, Definition of Done |

## Principes non négociables

1. **100 % gratuit les 2 premières années** — mais le backend supporte les plans
   FREE / PRO / PRO+ / BOOST / PREMIUM dès le départ (dormants).
2. **Mobile first**, performance excellente (Core Web Vitals), SEO structurel.
3. **Albanais + anglais** au lancement, i18n externalisée, zéro texte hardcodé.
4. **Le MVP n'est pas jetable** : c'est la première version du produit final.
5. **Qualité > quantité** : 20 fonctionnalités excellentes plutôt que 100 moyennes.
6. **Ranking honnête** : jamais de faveur cachée au payant, sponsorisé = identifié.
7. S'inspirer des mécaniques marketplace éprouvées, **ne rien copier** (code, textes,
   design, marque).
