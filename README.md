# Petites aventures

**Une roue d’idées pour sortir de la routine, à son rythme et selon ses envies.**

Envie de faire quelque chose, mais sans savoir quoi ? Petites aventures propose des activités simples à faire seul, à deux ou en groupe. Il suffit d’indiquer le temps disponible, son budget et ses envies, puis de laisser la roue choisir une idée.

**[Découvrir l’application en ligne](https://hajar-abd.github.io/roue_aventure/)**

Le site est déployé sur github pages et s’utilise directement dans le navigateur, sur ordinateur ou téléphone, sans installation ni création de compte.

## L’idée du projet

On n’a pas toujours besoin d’une grande sortie ou d’un budget important pour changer un peu son quotidien. Parfois, il manque simplement une idée et un petit coup de pouce pour se lancer.

L’application répond à cette question : **« Qu’est-ce que je peux faire aujourd’hui avec le temps et les moyens que j’ai ? »** Elle transforme ce choix en un moment ludique, tout en proposant des activités accompagnées d’instructions concrètes.

## Comment ça fonctionne ?

1. **Choisir ses critères** : le temps disponible, le budget maximal par personne, la compagnie et le lieu.
2. **Préciser ses envies**, si on le souhaite : créativité, découverte, gourmandise, détente ou mouvement.
3. **Cliquer sur « Trouver mon aventure »** : la roue sélectionne une activité compatible.
4. **Découvrir sa fiche** : une description, la durée estimée, le budget, le matériel nécessaire et trois étapes pour se lancer.
5. **Passer à l’action** avec « C’est parti », ou demander une autre idée.

Les filtres permettent de choisir jusqu’à **15, 30, 60 ou 120 minutes**, avec un budget maximal de **0, 5, 15 ou 30 euros par personne**, à l’intérieur ou à l’extérieur.

## Quelques idées à découvrir

Le catalogue contient **56 activités** réparties entre cinq envies. Par exemple :

- **La chasse aux couleurs** : transformer une promenade en collection de photos autour d’une couleur.
- **Un seul trait** : dessiner un objet sans lever le crayon.
- **Les yeux gourmands** : redécouvrir des aliments du placard lors d’une dégustation à l’aveugle.
- **Une chanson, rien d’autre** : prendre le temps d’écouter un morceau avec toute son attention.
- **Le salon fait sa fête** : improviser une petite séance de danse chez soi.

La roue pioche dans ce catalogue selon les critères choisis. Si aucune activité ne correspond, l’application suggère des ajustements pour élargir les possibilités.

## Un carnet pour garder ses aventures

La rubrique **« Mon carnet »** conserve les 50 derniers tirages. Elle permet de retrouver une fiche et de distinguer les activités proposées, choisies ou réalisées.

Il est également possible de copier le texte d’un défi pour le garder ou le partager avec quelqu’un.

Les préférences et le carnet sont enregistrés dans le navigateur utilisé, sans compte ni envoi de ces données à un serveur. Ils ne se synchronisent pas entre appareils et peuvent disparaître si les données du navigateur sont effacées.

## Une expérience simple et agréable

L’interface est en français, avec une ambiance de carnet : fond crème, touches terracotta et vert sauge. Elle s’adapte aux petits écrans et permet une navigation au clavier. Les animations tiennent compte des préférences de réduction des mouvements du navigateur.

Les durées et les budgets restent indicatifs. Une activité annoncée comme gratuite suppose que le matériel nécessaire est déjà disponible.

## Côté réalisation

Le projet est développé avec react et typescript, mis en forme avec du css et construit avec vite. Il associe une interface interactive, un filtrage des activités, un tirage aléatoire et une sauvegarde locale du carnet.

Le dépôt contient également des tests de la logique de l’application et des parcours utilisateur. Le site est publié automatiquement sur github pages à partir de la branche principale.
