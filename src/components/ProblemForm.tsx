'use client';

/*
  Copyright (c) 2025 Oussama Bouhadef (sigl1).
  All rights reserved.

  Component maintained by Oussama Bouhadef (sigl1).
*/

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type Constraint = {
  coefficients: number[];
  sign: string;
  rhs: number;
};

type Problem = {
  objective: {
    type: 'max' | 'min';
    coefficients: number[];
  };
  constraints: Constraint[];
};

interface ProblemFormProps {
  numVars: number;
  numConstraints: number;
}

export function ProblemForm({ numVars, numConstraints }: ProblemFormProps) {
  const router = useRouter();
  const [objectiveType, setObjectiveType] = useState<'max' | 'min'>('max');
  const [objectiveCoeffs, setObjectiveCoeffs] = useState<number[]>(Array(numVars).fill(0));
  const [constraints, setConstraints] = useState<Constraint[]>(
    Array(numConstraints).fill(0).map(() => ({
      coefficients: Array(numVars).fill(0),
      sign: '<=',
      rhs: 0
    }))
  );
  const [error, setError] = useState<string>('');
  
  // Mettre à jour les états lorsque les props changent
  useEffect(() => {
    console.log('Props changed:', { numVars, numConstraints });
    
    // Vérifier si nous devons charger l'exemple
    const useExample = typeof window !== 'undefined' && localStorage.getItem('useExample') === 'true';
    
    if (useExample && numVars === 2 && numConstraints === 3) {
      // Exemple préconfiguré : Maximiser z = 3x₁ + 2x₂
      // Sous contraintes :
      // 2x₁ + x₂ ≤ 18
      // 2x₁ + 3x₂ ≤ 42
      // 3x₁ + x₂ ≤ 24
      // x₁, x₂ ≥ 0
      
      // Définir la fonction objectif
      setObjectiveType('max');
      setObjectiveCoeffs([3, 2]);
      
      // Définir les contraintes
      setConstraints([
        {
          coefficients: [2, 1],
          sign: '<=',
          rhs: 18
        },
        {
          coefficients: [2, 3],
          sign: '<=',
          rhs: 42
        },
        {
          coefficients: [3, 1],
          sign: '<=',
          rhs: 24
        }
      ]);
      
      // Effacer le flag pour ne pas recharger l'exemple à chaque fois
      localStorage.removeItem('useExample');
    } else {
      setObjectiveCoeffs(prev => {
        // Conserver les valeurs existantes si possible
        const newCoeffs = Array(numVars).fill(0);
        for (let i = 0; i < Math.min(prev.length, numVars); i++) {
          newCoeffs[i] = prev[i];
        }
        return newCoeffs;
      });
      
      setConstraints(prev => {
        // Créer un nouveau tableau de contraintes avec le bon nombre
        const newConstraints = Array(numConstraints).fill(0).map((_, i) => {
          // Réutiliser les contraintes existantes si possible
          if (i < prev.length) {
            const oldConstraint = prev[i];
            const newCoefficients = Array(numVars).fill(0);
            
            // Copier les coefficients existants
            for (let j = 0; j < Math.min(oldConstraint.coefficients.length, numVars); j++) {
              newCoefficients[j] = oldConstraint.coefficients[j];
            }
            
            return {
              coefficients: newCoefficients,
              sign: oldConstraint.sign,
              rhs: oldConstraint.rhs
            };
          } else {
            // Créer une nouvelle contrainte
            return {
              coefficients: Array(numVars).fill(0),
              sign: '<=',
              rhs: 0
            };
          }
        });
        
        return newConstraints;
      });
    }
  }, [numVars, numConstraints]);

  const handleObjectiveCoefficientChange = (index: number, value: string) => {
    const newCoefficients = [...objectiveCoeffs];
    
    if (value === '') {
      // Si l'utilisateur efface le champ, stocker 0 mais afficher vide
      newCoefficients[index] = 0;
    } else {
      // Sinon, convertir en nombre
      newCoefficients[index] = parseFloat(value) || 0;
    }
    
    setObjectiveCoeffs(newCoefficients);
  };

  const handleConstraintCoefficientChange = (constraintIndex: number, varIndex: number, value: string) => {
    const newConstraints = [...constraints];
    
    if (value === '') {
      // Si l'utilisateur efface le champ, stocker 0 mais afficher vide
      newConstraints[constraintIndex].coefficients[varIndex] = 0;
    } else {
      // Sinon, convertir en nombre
      newConstraints[constraintIndex].coefficients[varIndex] = parseFloat(value) || 0;
    }
    
    setConstraints(newConstraints);
  };

  const handleConstraintSignChange = (constraintIndex: number, sign: string) => {
    const newConstraints = [...constraints];
    newConstraints[constraintIndex].sign = sign;
    setConstraints(newConstraints);
  };

  const handleConstraintRhsChange = (constraintIndex: number, value: string) => {
    const newConstraints = [...constraints];
    
    if (value === '') {
      // Si l'utilisateur efface le champ, stocker 0 mais afficher vide
      newConstraints[constraintIndex].rhs = 0;
    } else {
      // Sinon, convertir en nombre
      newConstraints[constraintIndex].rhs = parseFloat(value) || 0;
    }
    
    setConstraints(newConstraints);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (objectiveCoeffs.every(coeff => coeff === 0)) {
      setError('La fonction objectif doit avoir au moins un coefficient non nul');
      return;
    }
    
    for (let i = 0; i < constraints.length; i++) {
      if (constraints[i].coefficients.every(coeff => coeff === 0)) {
        setError(`La contrainte ${i + 1} doit avoir au moins un coefficient non nul`);
        return;
      }
    }
    
    const problem: Problem = {
      objective: {
        type: objectiveType,
        coefficients: objectiveCoeffs
      },
      constraints
    };
    
    // Stocker le problème dans localStorage pour le récupérer sur la page de résolution
    localStorage.setItem('simplexProblem', JSON.stringify(problem));
    
    // Rediriger vers la page de résolution en utilisant window.location pour forcer la navigation
    console.log('Redirection vers /solve');
    window.location.href = '/solve';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Fonction objectif */}
      <div className="card">
        <h3 className="card-title">Fonction objectif</h3>
        <div className="flex items-center mb-4">
          <select 
            value={objectiveType} 
            onChange={(e) => setObjectiveType(e.target.value as 'max' | 'min')}
            className="input-field mr-4"
          >
            <option value="max">Maximiser</option>
            <option value="min">Minimiser</option>
          </select>
          <div className="flex flex-wrap items-center">
            {objectiveCoeffs.map((coeff, index) => (
              <div key={`obj-${index}`} className="flex items-center mr-4 mb-2">
                <input
                  type="number"
                  step="any"
                  value={coeff === 0 ? '' : coeff}
                  placeholder="0"
                  onChange={(e) => handleObjectiveCoefficientChange(index, e.target.value)}
                  className="input-field w-20 mr-2"
                />
                <span>x<sub>{index + 1}</sub></span>
                {index < objectiveCoeffs.length - 1 && <span className="ml-2">+</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Contraintes */}
      <div className="card">
        <h3 className="card-title">Contraintes</h3>
        {constraints.map((constraint, constraintIndex) => (
          <div key={`constraint-${constraintIndex}`} className="mb-6 p-4 border border-blue-200 rounded-lg">
            <h4 className="text-blue-700 font-bold mb-3">Contrainte {constraintIndex + 1}</h4>
            <div className="flex flex-wrap items-center mb-2">
              {constraint.coefficients.map((coeff, varIndex) => (
                <div key={`constraint-${constraintIndex}-var-${varIndex}`} className="flex items-center mr-4 mb-2">
                  <input
                    type="number"
                    step="any"
                    value={coeff === 0 ? '' : coeff}
                    placeholder="0"
                    onChange={(e) => handleConstraintCoefficientChange(
                      constraintIndex, 
                      varIndex, 
                      e.target.value
                    )}
                    className="input-field w-20 mr-2"
                  />
                  <span>x<sub>{varIndex + 1}</sub></span>
                  {varIndex < constraint.coefficients.length - 1 && <span className="ml-2">+</span>}
                </div>
              ))}
              
              <select
                value={constraint.sign}
                onChange={(e) => handleConstraintSignChange(constraintIndex, e.target.value)}
                className="input-field mx-4"
              >
                <option value="<=">≤</option>
                <option value="=">＝</option>
                <option value=">=">≥</option>
              </select>
              
              <input
                type="number"
                step="any"
                value={constraint.rhs === 0 ? '' : constraint.rhs}
                placeholder="0"
                onChange={(e) => handleConstraintRhsChange(
                  constraintIndex, 
                  e.target.value
                )}
                className="input-field w-20"
              />
            </div>
          </div>
        ))}
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      <div className="flex justify-between">
        <button 
          type="button" 
          onClick={() => router.back()} 
          className="btn-secondary"
        >
          Retour
        </button>
        <button type="submit" className="btn-primary">
          Résoudre
        </button>
      </div>
    </form>
  );
}
