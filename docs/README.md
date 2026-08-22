# ALLOPUNO — Dossier d'architecture

Ce dossier répond à la section 132 du cahier des charges : livrer l'architecture
technique, l'architecture produit, le schéma de base de données, la structure API,
les user flows, les admin flows, le modèle de sécurité et la roadmap **avant**
d'écrire la première ligne de code produit.

## Ordre de lecture recommandé

1. [00 — Synthèse & décisions](00-synthese-decisions.md) — à lire en premier :
   toutes les décisions structurantes et leurs justifications, les risques, les
   points à valider.
2. [01 — Architecture technique](01-architecture-technique.md)
3. [02 — Architecture produit & flows](02-architecture-produit-flows.md)
4. [03 — Base de données](03-database.md) et [schema.sql](schema.sql)
5. [04 — API](04-api.md)
6. [05 — Sécurité, modération & risk](05-securite-moderation-risk.md)
7. [06 — Matching & notifications](06-matching-notifications.md)
8. [07 — Analytics](07-analytics.md)
9. [08 — Roadmap](08-roadmap.md)

## Traçabilité avec le cahier des charges

Chaque document référence les sections du cahier des charges (notées `CDC §n`)
qu'il couvre. Le cahier des charges lui-même (134 sections) fait foi pour le
périmètre produit ; ce dossier fait foi pour les choix techniques.
