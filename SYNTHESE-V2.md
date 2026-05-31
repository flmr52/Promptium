# Synthese Promptium — V1 vs V2

## Vue d'ensemble

| | **V1** | **V2** |
|--|--------|--------|
| **Date** | 28 mai 2026 | 30 mai → 31 mai 2026 |
| **Temps total utilisateur** | 21 min | 3h19 |
| **Fichiers produits** | 1 (index.html) | 42 fichiers |
| **Lignes de code** | 692 | 10 060 |
| **Tests** | 0 | 141 (98% couverture) |
| **Commits** | 3 | 15 |
| **Taille prod** | 31 KB | 87 KB (autonome, offline) |

## Tokens consommes

| | **V1** | **V2** | **Total** |
|--|--------|--------|-----------|
| **Tokens input** | ~19 000 | ~223 000 | ~242 000 |
| **Tokens output** | ~7 000 | ~142 000 | ~149 000 |
| **Total tokens** | ~26 000 | ~365 000 | ~391 000 |

## Estimation des couts

Basee sur les tarifs API Claude Opus 4 : $15/M tokens input, $75/M tokens output.

| | **V1** | **V2** | **Total** |
|--|--------|--------|-----------|
| **Cout input** | $0.29 | $3.34 | $3.63 |
| **Cout output** | $0.50 | $10.62 | $11.12 |
| **Cout total** | **$0.79** (~0.72 EUR) | **$13.97** (~12.85 EUR) | **$14.76** (~13.58 EUR) |

> Note : avec un abonnement Claude Code (Max/Pro), le cout reel est inclus dans le forfait mensuel.

> Le temps total utilisateur correspond au temps reel passe devant l'ecran (du premier au dernier message), incluant la reflexion, les tests navigateur et les echanges.

## Rapport qualite/prix V2

- 10 060 lignes de code production (42 fichiers)
- 141 tests unitaires, 98.25% de couverture
- Documentation complete en francais
- Application 100% autonome, fonctionne offline
- **Cout : ~0.14 centime par ligne de code testee et documentee**

## Fonctionnalites V2

- Builder C.R.A.F.T. (coeur de l'app, conserve de V1)
- Bibliotheque de prompts (drawer lateral)
- 12 prompts par defaut bilingues (FR/EN)
- CRUD complet (creation, modification, suppression)
- Categories (7 par defaut + utilisateur)
- Tri (alphabetique, date, favoris en premier)
- Recherche instantanee (titre, contenu, tags)
- Favoris (prompts utilisateur et par defaut)
- Export/Import JSON avec fusion intelligente
- Suppression/restauration des prompts par defaut par categorie
- Internationalisation FR/EN
- Accessibilite (ARIA, focus clavier, Escape)
- Mode offline (zero dependance externe)
- Build single-file (87 KB, fonctionne en file://)
- Deploy GitHub Pages avec CI (tests + build)
- Outil de preview multi-devices (6 appareils simultanes)
- Responsive mobile : textareas dimensionnes pour les placeholders

## Sprints realises

| Sprint | Contenu | Duree |
|--------|---------|-------|
| 1 | Restructuration modules ES6 + build | ~15 min |
| 2 | Logique metier (library, categories, sorting, search, favorites) | ~10 min |
| 3 | UI bibliotheque (panneau, recherche, filtres, modales) | ~10 min |
| 4 | Integration builder-bibliotheque, export/import | ~15 min |
| 5 | Accessibilite, offline, polish UX | ~5 min |
| 6 | QA final, coverage, CI pipeline | ~5 min |
| 7 | Suppression/restauration prompts par defaut | ~40 min |
| 8 | Drawer lateral, fix favoris, ajustements visuels | ~40 min |
| 9 | Responsive mobile (textareas), outil preview multi-devices | ~20 min |
