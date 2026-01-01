/*
  Copyright (c) 2025 Oussama Bouhadef (sigl1).
  All rights reserved.

  This file is part of the Simplexe application. It was authored
  and is maintained by Oussama Bouhadef (sigl1). Redistribution
  or use requires permission from the copyright holder.
*/

import { create, all } from 'mathjs';

const math = create(all);

// Types pour les problèmes de programmation linéaire
export type ObjectiveType = 'max' | 'min';

export type Problem = {
  objective: {
    type: ObjectiveType;
    coefficients: number[];
  };
  constraints: Constraint[];
};

export type Constraint = {
  coefficients: number[];
  sign: string;
  rhs: number;
};

export type TableauRow = number[];
export type Tableau = TableauRow[];

export type SimplexeIteration = {
  tableau: Tableau;
  basicVariables: string[];
  nonBasicVariables: string[];
  pivotRow: number | null;
  pivotColumn: number | null;
  pivotElement: number | null;
  enteringVariable: string | null;
  leavingVariable: string | null;
  explanation: string;
  isOptimal: boolean;
  isUnbounded: boolean;
};

export type SimplexeResult = {
  iterations: SimplexeIteration[];
  optimal: boolean;
  unbounded: boolean;
  infeasible: boolean;
  objectiveValue: number | null;
  solution: Record<string, number>;
  dualSolution: Record<string, number>;
  method: 'primal' | 'dual';
};

// Fonction pour standardiser un problème de programmation linéaire
export function standardizeLP(problem: Problem): {
  standardProblem: Problem;
  originalToStandard: Record<string, string>;
  standardToOriginal: Record<string, string>;
} {
  const { objective, constraints } = problem;
  const numVars = objective.coefficients.length;
  
  // Initialiser les mappages de variables
  const originalToStandard: Record<string, string> = {};
  const standardToOriginal: Record<string, string> = {};
  
  // Standardiser la fonction objectif (toujours maximiser)
  const standardObjective = {
    type: 'max' as ObjectiveType,
    coefficients: [...objective.coefficients]
  };
  
  if (objective.type === 'min') {
    // Si c'est un problème de minimisation, multiplier les coefficients par -1
    standardObjective.coefficients = standardObjective.coefficients.map(c => -c);
  }
  
  // Standardiser les contraintes
  const standardConstraints: Constraint[] = [];
  
  constraints.forEach((constraint, index) => {
    const { coefficients, sign, rhs } = constraint;
    
    if (sign === '<=' || sign === '=') {
      // Contrainte de type <= ou =, on l'ajoute directement
      standardConstraints.push({
        coefficients: [...coefficients],
        sign: '=',
        rhs: Math.max(0, rhs) // Assurer que RHS est non-négatif
      });
    }
    
    if (sign === '>=') {
      // Contrainte de type >=, on multiplie par -1
      standardConstraints.push({
        coefficients: coefficients.map(c => -c),
        sign: '=',
        rhs: -rhs
      });
    }
  });
  
  // Mapper les variables originales aux variables standard
  for (let i = 0; i < numVars; i++) {
    const originalVar = `x${i + 1}`;
    const standardVar = `x${i + 1}`;
    originalToStandard[originalVar] = standardVar;
    standardToOriginal[standardVar] = originalVar;
  }
  
  return {
    standardProblem: {
      objective: standardObjective,
      constraints: standardConstraints
    },
    originalToStandard,
    standardToOriginal
  };
}

// Fonction pour créer le tableau initial du simplexe
export function createInitialTableau(problem: Problem): {
  tableau: Tableau;
  basicVariables: string[];
  nonBasicVariables: string[];
} {
  const { objective, constraints } = problem;
  const numVars = objective.coefficients.length;
  const numConstraints = constraints.length;
  
  // Créer les variables de base (variables d'écart)
  const basicVariables: string[] = [];
  for (let i = 0; i < numConstraints; i++) {
    basicVariables.push(`s${i + 1}`);
  }
  
  // Créer les variables hors base (variables de décision)
  const nonBasicVariables: string[] = [];
  for (let i = 0; i < numVars; i++) {
    nonBasicVariables.push(`x${i + 1}`);
  }
  
  // Créer le tableau initial
  const tableau: Tableau = [];
  
  // Ajouter les lignes de contraintes
  constraints.forEach((constraint, i) => {
    const row: number[] = [];
    
    // Coefficients des variables de décision
    row.push(...constraint.coefficients);
    
    // Coefficients des variables d'écart (matrice identité)
    for (let j = 0; j < numConstraints; j++) {
      row.push(i === j ? 1 : 0);
    }
    
    // RHS
    row.push(constraint.rhs);
    
    tableau.push(row);
  });
  
  // Ajouter la ligne de la fonction objectif (négative pour la maximisation)
  const objectiveRow: number[] = [];
  
  // Coefficients des variables de décision (négatifs pour la maximisation)
  objectiveRow.push(...objective.coefficients.map(c => -c));
  
  // Coefficients des variables d'écart (zéros)
  for (let i = 0; i < numConstraints; i++) {
    objectiveRow.push(0);
  }
  
  // RHS de la fonction objectif (initialement 0)
  objectiveRow.push(0);
  
  tableau.push(objectiveRow);
  
  return { tableau, basicVariables, nonBasicVariables };
}

// Fonction pour trouver la colonne pivot (variable entrante)
export function findPivotColumn(tableau: Tableau): number | null {
  const lastRow = tableau[tableau.length - 1];
  const objectiveCoefficients = lastRow.slice(0, lastRow.length - 1);
  
  // Trouver l'indice du coefficient le plus négatif dans la ligne objectif
  let pivotColumn = -1;
  let minValue = 0;
  
  for (let i = 0; i < objectiveCoefficients.length; i++) {
    if (objectiveCoefficients[i] < minValue) {
      minValue = objectiveCoefficients[i];
      pivotColumn = i;
    }
  }
  
  return pivotColumn >= 0 ? pivotColumn : null;
}

// Fonction pour trouver la ligne pivot (variable sortante)
export function findPivotRow(tableau: Tableau, pivotColumn: number): number | null {
  let pivotRow = -1;
  let minRatio = Infinity;
  
  // Parcourir toutes les lignes sauf la dernière (ligne objectif)
  for (let i = 0; i < tableau.length - 1; i++) {
    const row = tableau[i];
    const coefficient = row[pivotColumn];
    const rhs = row[row.length - 1];
    
    // Vérifier si le coefficient est positif
    if (coefficient > 0) {
      const ratio = rhs / coefficient;
      if (ratio < minRatio) {
        minRatio = ratio;
        pivotRow = i;
      }
    }
  }
  
  return pivotRow >= 0 ? pivotRow : null;
}

// Fonction pour effectuer une itération du simplexe
export function simplexeIteration(
  tableau: Tableau,
  basicVariables: string[],
  nonBasicVariables: string[]
): SimplexeIteration {
  // Copier le tableau pour ne pas modifier l'original
  const newTableau = tableau.map(row => [...row]);
  const newBasicVariables = [...basicVariables];
  const newNonBasicVariables = [...nonBasicVariables];
  
  // Trouver la colonne pivot (variable entrante)
  const pivotColumn = findPivotColumn(newTableau);
  
  // Si aucune colonne pivot n'est trouvée, la solution est optimale
  if (pivotColumn === null) {
    return {
      tableau: newTableau,
      basicVariables: newBasicVariables,
      nonBasicVariables: newNonBasicVariables,
      pivotRow: null,
      pivotColumn: null,
      pivotElement: null,
      enteringVariable: null,
      leavingVariable: null,
      explanation: "La solution est optimale car tous les coefficients de la fonction objectif sont non-négatifs.",
      isOptimal: true,
      isUnbounded: false
    };
  }
  
  // Trouver la ligne pivot (variable sortante)
  const pivotRow = findPivotRow(newTableau, pivotColumn);
  
  // Si aucune ligne pivot n'est trouvée, le problème est non borné
  if (pivotRow === null) {
    return {
      tableau: newTableau,
      basicVariables: newBasicVariables,
      nonBasicVariables: newNonBasicVariables,
      pivotRow: null,
      pivotColumn: pivotColumn,
      pivotElement: null,
      enteringVariable: newNonBasicVariables[pivotColumn],
      leavingVariable: null,
      explanation: "Le problème est non borné car aucune contrainte ne limite la variable entrante.",
      isOptimal: false,
      isUnbounded: true
    };
  }
  
  // Élément pivot
  const pivotElement = newTableau[pivotRow][pivotColumn];
  
  // Variables entrante et sortante
  const enteringVariable = newNonBasicVariables[pivotColumn];
  const leavingVariable = newBasicVariables[pivotRow];
  
  // Mettre à jour uniquement la variable de base, la variable hors base reste inchangée
  newBasicVariables[pivotRow] = enteringVariable;
  // Nous ne modifions plus la liste des variables non basiques
  // newNonBasicVariables[pivotColumn] = leavingVariable;
  
  // Normaliser la ligne pivot
  const pivotRowValues = newTableau[pivotRow];
  for (let j = 0; j < pivotRowValues.length; j++) {
    newTableau[pivotRow][j] /= pivotElement;
  }
  
  // Mettre à jour les autres lignes
  for (let i = 0; i < newTableau.length; i++) {
    if (i !== pivotRow) {
      const factor = newTableau[i][pivotColumn];
      for (let j = 0; j < newTableau[i].length; j++) {
        newTableau[i][j] -= factor * newTableau[pivotRow][j];
      }
    }
  }
  
  // Générer l'explication
  const explanation = `
    La variable entrante est ${enteringVariable} (colonne ${pivotColumn + 1}) car elle a le coefficient le plus négatif (${tableau[tableau.length - 1][pivotColumn]}) dans la fonction objectif.
    La variable sortante est ${leavingVariable} (ligne ${pivotRow + 1}) car elle donne le ratio minimum (${(tableau[pivotRow][tableau[0].length - 1] / tableau[pivotRow][pivotColumn]).toFixed(2)}).
    L'élément pivot est ${pivotElement.toFixed(2)} à l'intersection de la ligne ${pivotRow + 1} et de la colonne ${pivotColumn + 1}.
    Nous avons divisé la ligne pivot par l'élément pivot, puis éliminé la variable ${enteringVariable} des autres lignes.
  `;
  
  return {
    tableau: newTableau,
    basicVariables: newBasicVariables,
    nonBasicVariables: newNonBasicVariables,
    pivotRow,
    pivotColumn,
    pivotElement,
    enteringVariable,
    leavingVariable,
    explanation,
    isOptimal: false,
    isUnbounded: false
  };
}

// Fonction principale pour résoudre un problème par la méthode du simplexe
export function solveWithSimplexe(problem: Problem): SimplexeResult {
  // Standardiser le problème
  const { standardProblem } = standardizeLP(problem);
  
  // Créer le tableau initial
  let { tableau, basicVariables, nonBasicVariables } = createInitialTableau(standardProblem);
  
  // Stocker les itérations
  const iterations: SimplexeIteration[] = [];
  
  // Ajouter l'itération initiale
  iterations.push({
    tableau: tableau.map(row => [...row]),
    basicVariables: [...basicVariables],
    nonBasicVariables: [...nonBasicVariables],
    pivotRow: null,
    pivotColumn: null,
    pivotElement: null,
    enteringVariable: null,
    leavingVariable: null,
    explanation: "Tableau initial avec les variables d'écart dans la base.",
    isOptimal: false,
    isUnbounded: false
  });
  
  // Nombre maximum d'itérations pour éviter les boucles infinies
  const maxIterations = 100;
  let iteration = 0;
  let optimal = false;
  let unbounded = false;
  
  // Itérer jusqu'à trouver une solution optimale ou détecter un problème non borné
  while (!optimal && !unbounded && iteration < maxIterations) {
    const result = simplexeIteration(tableau, basicVariables, nonBasicVariables);
    
    // Mettre à jour le tableau et les variables
    tableau = result.tableau;
    basicVariables = result.basicVariables;
    nonBasicVariables = result.nonBasicVariables;
    
    // Ajouter l'itération aux résultats
    iterations.push(result);
    
    // Vérifier si la solution est optimale ou non bornée
    optimal = result.isOptimal;
    unbounded = result.isUnbounded;
    
    iteration++;
  }
  
  // Extraire la solution
  const solution: Record<string, number> = {};
  const dualSolution: Record<string, number> = {};
  
  // Variables primales (variables de décision)
  for (let i = 0; i < nonBasicVariables.length; i++) {
    const variable = nonBasicVariables[i];
    if (variable.startsWith('x')) {
      solution[variable] = 0; // Variables hors base ont une valeur de 0
    }
  }
  
  for (let i = 0; i < basicVariables.length; i++) {
    const variable = basicVariables[i];
    if (variable.startsWith('x')) {
      solution[variable] = tableau[i][tableau[0].length - 1]; // Valeur dans la colonne RHS
    }
  }
  
  // Variables duales (multiplicateurs de Lagrange)
  const lastRow = tableau[tableau.length - 1];
  for (let i = 0; i < standardProblem.constraints.length; i++) {
    dualSolution[`y${i + 1}`] = lastRow[standardProblem.objective.coefficients.length + i];
  }
  
  // Valeur de la fonction objectif
  const objectiveValue = optimal ? lastRow[lastRow.length - 1] : null;
  
  return {
    iterations,
    optimal,
    unbounded,
    infeasible: false, // La détection d'infaisabilité nécessiterait une phase I du simplexe
    objectiveValue,
    solution,
    dualSolution,
    method: 'primal'
  };
}

// Fonction pour résoudre un problème par la méthode du simplexe dual
export function solveWithDualSimplexe(problem: Problem): SimplexeResult {
  // Standardiser le problème
  const { standardProblem } = standardizeLP(problem);
  
  // Créer le tableau initial
  let { tableau, basicVariables, nonBasicVariables } = createInitialTableau(standardProblem);
  
  // Stocker les itérations
  const iterations: SimplexeIteration[] = [];
  
  // Ajouter l'itération initiale
  iterations.push({
    tableau: tableau.map(row => [...row]),
    basicVariables: [...basicVariables],
    nonBasicVariables: [...nonBasicVariables],
    pivotRow: null,
    pivotColumn: null,
    pivotElement: null,
    enteringVariable: null,
    leavingVariable: null,
    explanation: "Tableau initial pour le simplexe dual.",
    isOptimal: false,
    isUnbounded: false
  });
  
  // Nombre maximum d'itérations pour éviter les boucles infinies
  const maxIterations = 100;
  let iteration = 0;
  let optimal = false;
  let unbounded = false;
  
  // Fonction pour trouver la ligne pivot dans le simplexe dual
  function findDualPivotRow(tableau: Tableau): number | null {
    let pivotRow = -1;
    let minRhs = 0;
    
    // Trouver la ligne avec le RHS le plus négatif
    for (let i = 0; i < tableau.length - 1; i++) {
      const rhs = tableau[i][tableau[i].length - 1];
      if (rhs < minRhs) {
        minRhs = rhs;
        pivotRow = i;
      }
    }
    
    return pivotRow >= 0 ? pivotRow : null;
  }
  
  // Fonction pour trouver la colonne pivot dans le simplexe dual
  function findDualPivotColumn(tableau: Tableau, pivotRow: number): number | null {
    let pivotColumn = -1;
    let minRatio = Infinity;
    
    const row = tableau[pivotRow];
    const lastRow = tableau[tableau.length - 1];
    
    // Parcourir les coefficients de la ligne pivot
    for (let j = 0; j < row.length - 1; j++) {
      const coefficient = row[j];
      
      // On cherche un coefficient négatif
      if (coefficient < 0) {
        const ratio = Math.abs(lastRow[j] / coefficient);
        if (ratio < minRatio) {
          minRatio = ratio;
          pivotColumn = j;
        }
      }
    }
    
    return pivotColumn >= 0 ? pivotColumn : null;
  }
  
  // Itérer jusqu'à trouver une solution optimale ou détecter un problème infaisable
  while (!optimal && !unbounded && iteration < maxIterations) {
    // Vérifier si tous les RHS sont non-négatifs (solution primale réalisable)
    let allRhsNonNegative = true;
    for (let i = 0; i < tableau.length - 1; i++) {
      if (tableau[i][tableau[i].length - 1] < 0) {
        allRhsNonNegative = false;
        break;
      }
    }
    
    // Si tous les RHS sont non-négatifs, vérifier l'optimalité
    if (allRhsNonNegative) {
      const lastRow = tableau[tableau.length - 1];
      let allCoeffsNonNegative = true;
      
      for (let j = 0; j < lastRow.length - 1; j++) {
        if (lastRow[j] < 0) {
          allCoeffsNonNegative = false;
          break;
        }
      }
      
      if (allCoeffsNonNegative) {
        optimal = true;
        iterations.push({
          tableau: tableau.map(row => [...row]),
          basicVariables: [...basicVariables],
          nonBasicVariables: [...nonBasicVariables],
          pivotRow: null,
          pivotColumn: null,
          pivotElement: null,
          enteringVariable: null,
          leavingVariable: null,
          explanation: "La solution est optimale car tous les RHS sont non-négatifs et tous les coefficients de la fonction objectif sont non-négatifs.",
          isOptimal: true,
          isUnbounded: false
        });
        break;
      }
    }
    
    // Trouver la ligne pivot (RHS le plus négatif)
    const pivotRow = findDualPivotRow(tableau);
    
    // Si aucune ligne pivot n'est trouvée, la solution est optimale
    if (pivotRow === null) {
      optimal = true;
      iterations.push({
        tableau: tableau.map(row => [...row]),
        basicVariables: [...basicVariables],
        nonBasicVariables: [...nonBasicVariables],
        pivotRow: null,
        pivotColumn: null,
        pivotElement: null,
        enteringVariable: null,
        leavingVariable: null,
        explanation: "La solution est optimale car tous les RHS sont non-négatifs.",
        isOptimal: true,
        isUnbounded: false
      });
      break;
    }
    
    // Trouver la colonne pivot
    const pivotColumn = findDualPivotColumn(tableau, pivotRow);
    
    // Si aucune colonne pivot n'est trouvée, le problème est infaisable
    if (pivotColumn === null) {
      unbounded = true; // En réalité, cela signifie que le problème dual est non borné, donc le primal est infaisable
      iterations.push({
        tableau: tableau.map(row => [...row]),
        basicVariables: [...basicVariables],
        nonBasicVariables: [...nonBasicVariables],
        pivotRow: pivotRow,
        pivotColumn: null,
        pivotElement: null,
        enteringVariable: null,
        leavingVariable: basicVariables[pivotRow],
        explanation: "Le problème est infaisable car aucune variable ne peut entrer dans la base pour éliminer la valeur négative du RHS.",
        isOptimal: false,
        isUnbounded: true
      });
      break;
    }
    
    // Élément pivot
    const pivotElement = tableau[pivotRow][pivotColumn];
    
    // Variables entrante et sortante
    const enteringVariable = nonBasicVariables[pivotColumn];
    const leavingVariable = basicVariables[pivotRow];
    
    // Mettre à jour uniquement la variable de base, la variable hors base reste inchangée
    basicVariables[pivotRow] = enteringVariable;
    // Nous ne modifions plus la liste des variables non basiques
    // nonBasicVariables[pivotColumn] = leavingVariable;
    
    // Normaliser la ligne pivot
    const pivotRowValues = tableau[pivotRow];
    for (let j = 0; j < pivotRowValues.length; j++) {
      tableau[pivotRow][j] /= pivotElement;
    }
    
    // Mettre à jour les autres lignes
    for (let i = 0; i < tableau.length; i++) {
      if (i !== pivotRow) {
        const factor = tableau[i][pivotColumn];
        for (let j = 0; j < tableau[i].length; j++) {
          tableau[i][j] -= factor * tableau[pivotRow][j];
        }
      }
    }
    
    // Générer l'explication
    const explanation = `
      La variable sortante est ${leavingVariable} (ligne ${pivotRow + 1}) car elle a le RHS le plus négatif (${tableau[pivotRow][tableau[0].length - 1]}).
      La variable entrante est ${enteringVariable} (colonne ${pivotColumn + 1}) car elle donne le ratio minimum pour maintenir la dualité.
      L'élément pivot est ${pivotElement.toFixed(2)} à l'intersection de la ligne ${pivotRow + 1} et de la colonne ${pivotColumn + 1}.
      Nous avons divisé la ligne pivot par l'élément pivot, puis éliminé la variable ${enteringVariable} des autres lignes.
    `;
    
    // Ajouter l'itération aux résultats
    iterations.push({
      tableau: tableau.map(row => [...row]),
      basicVariables: [...basicVariables],
      nonBasicVariables: [...nonBasicVariables],
      pivotRow,
      pivotColumn,
      pivotElement,
      enteringVariable,
      leavingVariable,
      explanation,
      isOptimal: false,
      isUnbounded: false
    });
    
    iteration++;
  }
  
  // Extraire la solution
  const solution: Record<string, number> = {};
  const dualSolution: Record<string, number> = {};
  
  // Variables primales (variables de décision)
  for (let i = 0; i < nonBasicVariables.length; i++) {
    const variable = nonBasicVariables[i];
    if (variable.startsWith('x')) {
      solution[variable] = 0; // Variables hors base ont une valeur de 0
    }
  }
  
  for (let i = 0; i < basicVariables.length; i++) {
    const variable = basicVariables[i];
    if (variable.startsWith('x')) {
      solution[variable] = tableau[i][tableau[0].length - 1]; // Valeur dans la colonne RHS
    }
  }
  
  // Variables duales (multiplicateurs de Lagrange)
  const lastRow = tableau[tableau.length - 1];
  for (let i = 0; i < standardProblem.constraints.length; i++) {
    dualSolution[`y${i + 1}`] = lastRow[standardProblem.objective.coefficients.length + i];
  }
  
  // Valeur de la fonction objectif
  const objectiveValue = optimal ? lastRow[lastRow.length - 1] : null;
  
  return {
    iterations,
    optimal,
    unbounded: false,
    infeasible: unbounded, // Si le dual est non borné, le primal est infaisable
    objectiveValue,
    solution,
    dualSolution,
    method: 'dual'
  };
}
