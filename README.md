# Méthode Simplexe

Une application Next.js pour résoudre des problèmes de programmation linéaire par la méthode du simplexe (simplexe simple et simplexe dual).

## Fonctionnalités

- Interface utilisateur intuitive pour définir des problèmes de programmation linéaire
- Résolution par la méthode du simplexe primal
- Résolution par la méthode du simplexe dual
- Affichage des étapes de résolution sous forme de tableaux
- Explication détaillée de chaque itération
- Visualisation de la solution optimale

## Technologies utilisées

- Next.js
- React
- TypeScript
- Tailwind CSS
- Math.js

## Installation

1. Assurez-vous d'avoir Node.js installé (version 14 ou supérieure)
2. Obtenez les fichiers du projet
3. Installez les dépendances :

```bash
npm install
```

## Lancement de l'application

```bash
npm run dev
```

L'application sera accessible à l'adresse [http://localhost:3000](http://localhost:3000).

## Utilisation

1. Sur la page d'accueil, spécifiez le nombre de variables de décision et de contraintes
2. Définissez la fonction objectif et les contraintes
3. Choisissez entre le simplexe primal et le simplexe dual
4. Naviguez entre les différentes itérations pour comprendre la résolution
5. Consultez la solution optimale

## À propos de la méthode du simplexe

La méthode du simplexe est un algorithme permettant de résoudre des problèmes d'optimisation linéaire. Elle consiste à parcourir les sommets d'un polyèdre convexe défini par les contraintes du problème, en améliorant à chaque étape la valeur de la fonction objectif, jusqu'à atteindre l'optimum.

### Simplexe primal

Le simplexe primal part d'une solution de base réalisable et améliore progressivement la valeur de la fonction objectif en remplaçant une variable de base par une variable hors base.

### Simplexe dual

Le simplexe dual est utilisé lorsque la solution initiale n'est pas primale-réalisable mais est duale-réalisable. Il est particulièrement utile pour résoudre des problèmes où les contraintes sont modifiées après avoir trouvé une solution optimale.

---

Copyright (c) 2025 Oussama Bouhadef (sigl1). Tous droits réservés.
