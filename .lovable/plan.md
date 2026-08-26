# Performances et réactivité — pas de chargement quand la donnée est connue

Objectif : comportement d'application Android native. Aucun changement de design, d'icônes, de couleurs ni de fonctionnalités.

## Constat actuel (vérifié)

- Le gestionnaire (`src/routes/index.tsx`) affiche déjà le cache dossier immédiatement et n'affiche un état de chargement que si rien n'est connu ; les mutations sont appliquées de façon ciblée via le bus de patchs (`src/lib/files/live-sync.ts`).
- Les caches de dossiers (`src/lib/native/dir-cache.ts`), des applications, de la corbeille et des statistiques de stockage existent déjà en « afficher puis revalider ».
- Manques restants : le cache de dossiers est en mémoire seule (donc squelette au premier lancement après fermeture), les nombres d'éléments ne suivent pas les mutations, et le pull-to-refresh n'est pas branché partout.

## Ce qui sera fait

### 1. Compteurs d'éléments toujours exacts, sans recalcul
- Brancher le cache de comptage (`src/lib/files/folder-count.ts`) sur le bus de patchs : un ajout fait +1, une suppression ou un déplacement sortant fait −1, un déplacement entrant fait +1, immédiatement et sans appel natif.
- Remplacer l'invalidation par préfixe (qui force un recalcul complet) par cet ajustement ciblé ; ne recalculer que lorsque le patch ne permet pas de déduire la valeur.

### 2. Persistance des listes déjà vues
- Ajouter au cache de dossiers une persistance bornée et versionnée des derniers dossiers visités, pour que la première ouverture après relance affiche instantanément l'état connu puis revalide silencieusement.
- Persister de la même manière le cache des compteurs d'éléments.

### 3. Miniatures stables
- Conserver les URL de miniatures déjà résolues au-delà d'un changement d'écran (mémoire persistée du mapping fichier → vignette), pour supprimer la disparition/réapparition lors des allers-retours.
- Ne relâcher une vignette que lorsque sa source change réellement (mtime/taille).

### 4. Corbeille, coffre-fort, catégories, applications, stockage
- Vérifier chaque écran et appliquer le même schéma : rendu immédiat depuis le cache, revalidation en arrière-plan, squelette uniquement en l'absence totale de donnée.
- Corbeille : appliquer les patchs (suppression, restauration, purge) directement à la liste affichée et aux compteurs, sans relecture.

### 5. Pull-to-refresh uniforme
- Enregistrer une action d'actualisation réelle sur les écrans qui n'en ont pas encore : recherche, outils PDF, organisation, ainsi que les vues stockage/dossiers du gestionnaire si un cas manque.
- L'actualisation force une relecture réelle (contournement du cache) et applique un diff : seuls les éléments modifiés changent, aucune remise à zéro du défilement, aucun vidage temporaire.

### 6. Indicateur sous le header, header immobile
- Revoir le positionnement de l'indicateur dans `src/components/common/ScrollFeel.tsx` : ancrage recalculé sur le bas du header réel de la page affichée, indicateur en surimpression seulement, header jamais translaté ni redessiné, contenu non décalé de façon permanente.

### 7. Balayage final
- Parcourir les écrans restants pour repérer les recalculs à chaque ouverture et appliquer la même logique.
- Exécuter `bun run verify` (typecheck, lint, format, build) avant de conclure.

## Détails techniques

- Les patchs existants (`src/lib/index/patches.ts`) servent de source unique pour les mises à jour ciblées ; aucune nouvelle architecture de données.
- Les caches persistants sont versionnés, bornés en taille et tolérants aux données corrompues ; en cas d'échec de revalidation, la dernière valeur valide est conservée.
- Aucune modification de composants visuels au-delà du positionnement de l'indicateur d'actualisation.
