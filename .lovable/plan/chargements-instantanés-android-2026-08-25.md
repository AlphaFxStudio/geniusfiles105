# Chargements instantanés Android

## Objectif
Conserver les dernières données utiles à l’écran et effectuer les vérifications coûteuses en arrière-plan, sans squelette lors des réouvertures ni pendant les transferts.

## Modifications
- Faire du cache des dossiers un vrai modèle « afficher puis revalider » : retour synchrone immédiat des entrées connues, revalidation native silencieuse et déduplication des lectures concurrentes.
- Ajouter un cache persistant borné pour la corbeille et le tenir à jour lors des suppressions, restaurations et vidages afin qu’elle s’affiche dès la première frame.
- Centraliser un cache persistant des applications installées, avec variantes avec/sans icônes, déduplication et délai de fraîcheur ; conserver les anciennes données pendant une actualisation explicite ou au retour au premier plan.
- Mettre en cache les statistiques de stockage interne et les volumes externes ; initialiser les cartes avec la dernière valeur connue et actualiser discrètement, sans état « lecture » visible.
- Éviter les invalidations globales après les opérations disposant déjà d’un patch précis, afin que transferts, suppressions, renommages et créations ne vident pas les listes affichées.
- Vérifier les flux concernés et exécuter la barrière complète `bun run verify`.

## Détails techniques
- Les caches persistants seront versionnés, bornés et tolérants aux données corrompues.
- Une actualisation échouée conservera la dernière valeur valide au lieu de remplacer l’interface par du vide.
- Les changements natifs externes resteront détectés en arrière-plan ; seules les animations de chargement bloquantes disparaîtront.
