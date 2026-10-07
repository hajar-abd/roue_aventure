# petites aventures

Une petite aventure commence ici. Un peu de temps, un budget et une idée à découvrir.

Cette application aide à sortir de la routine grâce à une roue d’activités concrètes : créer, découvrir, goûter, se détendre ou bouger. L’interface française s’inspire d’un carnet, avec un fond crème, des accents terracotta et vert sauge. Elle est réalisée avec React, TypeScript, Vite et du CSS simple.

## Lancer le projet

Prérequis : Node.js 24 ou plus récent et npm. Le fichier `.nvmrc` indique la version majeure utilisée.

```bash
cd roue_aventure
npm ci
npm run dev
```

Vite indique dans le terminal le port du serveur de développement, généralement 5173. L’application est servie sous `/roue_aventure/`, comme sur GitHub Pages. Le serveur sert les fichiers de l’application ; aucun serveur applicatif, compte, clé ou base distante n’est nécessaire. Le cache npm est placé dans `.npm-cache/`, ignoré par Git, pour fonctionner aussi dans l’environnement cloud.

## Fonctionnalités

- 56 activités intégrées, avec un identifiant stable, une description, le matériel, la durée, le budget et trois étapes.
- Plafonds de 15, 30, 60 ou 120 minutes et de 0, 5, 15 ou 30 euros par personne. Compagnie : seul, à deux ou en groupe. Lieu : intérieur, extérieur ou indifférent.
- Catégories facultatives cumulables : une correspondance avec **au moins une** envie suffit. Le nombre compatible est affiché avant le tirage.
- Jusqu’à huit activités distinctes, échantillonnées sans remise. Une activité est ensuite choisie équitablement parmi ces secteurs avec l’aléatoire du navigateur. Le dernier résultat est exclu si une autre possibilité existe.
- Roue animée pendant 3,6 secondes, contrôles verrouillés et résultat révélé à l’arrêt. Le centre du secteur gagnant termine sous le repère fixe. Une seule idée est révélée directement ; zéro idée déclenche des suggestions sans modifier les filtres.
- Fiche textuelle, choix avec « C’est parti », statut réalisé, autre idée, copie avec retour visuel et texte sélectionnable si le presse-papiers est refusé ou absent.
- Historique des 50 derniers tirages avec date, statut individuel et réouverture des fiches. Suppression avec confirmation ; les préférences sont conservées.
- Sauvegarde dans `localStorage`, sous la clé `petites-aventures:v1`. Validation des données à la lecture, repli sur les valeurs par défaut en cas de corruption et fonctionnement en mémoire si le stockage est bloqué.
- Navigation au clavier, focus visible, groupes de filtres natifs, annonce du résultat aux lecteurs d’écran, liste textuelle des secteurs et respect de `prefers-reduced-motion`.

Aucune API, police distante, image distante, analyse d’audience ou autre requête externe n’est utilisée par l’application. Les bibliothèques de développement se téléchargent uniquement à l’installation.

## Vérifications

```bash
npm test             # Tests de logique avec Vitest
npm run build        # Vérification TypeScript et compilation de production
npm run test:e2e     # Parcours Chromium, ordinateur et téléphone simulé
```

Playwright utilise automatiquement `/usr/bin/chromium` s’il existe. Sinon, installez son navigateur :

```bash
npx playwright install chromium
```

Un autre exécutable Chromium peut être fourni avec `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. Les tests démarrent leur propre serveur sur le port 4173, qui doit être libre, et utilisent le chemin `/roue_aventure/`. Les captures des écrans d’accueil et de résultat sont écrites dans `test-results/` ; les traces sont conservées en cas d’échec.

Les 23 tests unitaires couvrent le catalogue, les 4 608 combinaisons de filtres, les catégories en « ou », les plafonds, les cas zéro/une activité, l’absence de doublons, l’exclusion de la dernière idée, la sélection, la géométrie de rotations successives, les statuts et la persistance, y compris des données corrompues et un stockage inaccessible.

Les 12 tests de navigateur exécutent six parcours sur ordinateur (1440 × 1100) et téléphone simulé (390 × 844) : alignement réel de la roue après animation, verrouillage des contrôles, statuts, restauration après rechargement, réouverture, non-répétition, cas limites, animation réduite, copie réussie simulée et repli, confirmation de suppression, stockage défaillant, absence de débordement horizontal, focus clavier et contrôles axe des règles WCAG A/AA retenues.

Vérifications effectuées dans l’environnement cloud : installation reproductible avec `npm ci`, compilation de production réussie, 23 tests unitaires et 12 parcours navigateur réussis. Les captures ordinateur et mobile ont été inspectées ; les contrastes signalés par axe ont été corrigés. Le clavier permet d’atteindre les filtres par le lien d’évitement et de changer les boutons radio avec les flèches. Le dossier compilé a aussi été servi par un serveur statique sous `/roue_aventure/` : scripts, styles, favicon, tirage, statut et restauration après rechargement ont été vérifiés. Aucun débordement horizontal n’a été détecté aux largeurs 320, 390, 768 et 1440 pixels. Les vérifications locales ne constituent pas une exécution du workflow sur GitHub.

## Hébergement statique

```bash
npm run build
npm run preview
```

Publiez **le contenu du dossier `dist/`** sous `/roue_aventure/`. `base: '/roue_aventure/'` dans `vite.config.ts` correspond au nom exact du dépôt `hajar-abd/roue_aventure`. Les scripts, styles et le favicon générés utilisent ce préfixe. Pour un autre sous-dossier ou un domaine personnalisé servant l’application à la racine, adaptez `base` et recompilez. Conservez le slash final du répertoire. Il n’y a pas de route applicative à réécrire. Servez les fichiers en HTTP(S), plutôt que d’ouvrir `index.html` directement avec `file://`.

HTTPS est recommandé pour l’accès au presse-papiers ; le repli manuel reste disponible. Les fichiers compilés suffisent à l’exécution ; Node.js n’est utilisé que pour le développement et la compilation.

## Déploiement sur GitHub Pages

Le workflow `.github/workflows/deploy.yml` s’exécute à chaque push sur **`main`**, la branche par défaut constatée sur le dépôt distant. Il propose aussi `workflow_dispatch` pour un lancement manuel depuis l’onglet **Actions** une fois le workflow présent sur `main`.

Le job de compilation installe Node.js à partir de `.nvmrc`, exécute `npm ci`, `npm test`, puis `npm run build`, et transmet uniquement `dist/` comme artefact Pages. Le job de déploiement utilise les actions officielles `configure-pages` et `deploy-pages`, avec les permissions `pages: write` et `id-token: write`, et l’environnement `github-pages`. La lecture du dépôt utilise `contents: read`. Aucun secret personnalisé, jeton personnel ou branche `gh-pages` n’est nécessaire au workflow. Les déploiements sont sérialisés, sans annuler celui en cours. Un lancement manuel sur une autre branche construit l’application mais ne la publie pas.

Réglages à effectuer dans le dépôt GitHub :

1. Dans **Settings → Pages → Build and deployment → Source**, sélectionner **GitHub Actions**.
2. Vérifier que GitHub Actions et les actions officielles utilisées par le workflow sont autorisées dans **Settings → Actions → General**, notamment si une politique d’organisation restreint les actions.
3. Dans **Settings → Environments → github-pages**, vérifier que les règles de déploiement autorisent `main`. Si une approbation de protection est requise, l’accorder lors du déploiement.
4. Après revue, fusionner la pull request pour déclencher le premier déploiement. La préparation de cette application ne fusionne pas la pull request. Si le workflow a échoué avant l’activation de Pages, le relancer depuis **Actions → Deploy to GitHub Pages → Run workflow**, branche `main`.

Adresse attendue **après un déploiement réussi** : `https://hajar-abd.github.io/roue_aventure/`. La réussite de la compilation locale ne signifie pas que cette adresse est déjà publiée. Le workflow fournit l’adresse effective dans l’environnement `github-pages`.

`node_modules/`, `dist/`, le cache npm et les résultats de tests restent ignorés par Git. Le dossier `dist/` est transmis comme artefact, jamais ajouté aux sources versionnées.

## Organisation

| Fichier                                              | Rôle                                                            |
| ---------------------------------------------------- | --------------------------------------------------------------- |
| `src/catalog.ts`                                     | Catalogue local et index des activités                          |
| `src/types.ts`                                       | Modèle de données, choix de filtres et libellés                 |
| `src/logic.ts`                                       | Filtrage, échantillonnage, calcul de rotation et texte à copier |
| `src/storage.ts`                                     | Validation, sauvegarde et gestion de l’historique               |
| `src/App.tsx`                                        | État de l’application et orchestration du tirage                |
| `src/Filters.tsx`, `src/Wheel.tsx`, `src/Result.tsx` | Interface des filtres, de la roue et de la fiche                |
| `src/styles.css`                                     | Apparence, adaptation aux écrans et animations                  |
| `src/*.test.ts`, `e2e/app.spec.ts`                   | Tests ciblés et parcours dans Chromium                          |

Pour ajouter une activité, utilisez un identifiant unique qui ne changera plus et renseignez tous les champs de `Activity`. L’identifiant relie les tirages aux fiches : supprimer un identifiant déjà utilisé rend une ancienne sauvegarde invalide dans cette version. Le catalogue garde volontairement beaucoup d’idées gratuites de quinze minutes à l’intérieur.

## Limites de cette première version

- Durées et budgets sont indicatifs, sans vérification de prix. « Gratuit » suppose que le matériel est déjà possédé. Les activités ne garantissent pas une disponibilité locale ; aucun commerce, horaire ou adresse n’est inventé.
- Les données restent liées au navigateur et à l’origine du site, sans synchronisation ni export d’historique. Effacer les données du navigateur les supprime. Plusieurs onglets ne synchronisent pas leurs modifications en direct.
- L’application fonctionne sans appel réseau après le chargement, mais n’installe pas de service worker : le rechargement hors ligne n’est pas garanti.
- Les essais de navigateur portent sur Chromium et une simulation mobile, pas sur un téléphone physique, Safari ou Firefox. L’audit automatique d’accessibilité ne remplace pas une évaluation complète avec des lecteurs d’écran.
- La copie réussie est vérifiée avec un presse-papiers simulé ; le comportement du presse-papiers système dépend des permissions du navigateur.
- Aucun déploiement public n’est effectué par les commandes de développement.
