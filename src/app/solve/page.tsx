'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Problem, 
  solveWithSimplexe, 
  solveWithDualSimplexe, 
  SimplexeResult, 
  SimplexeIteration, 
  Tableau 
} from '../../utils/simplexe';

export default function SolvePage() {
  const router = useRouter();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [result, setResult] = useState<SimplexeResult | null>(null);
  const [method, setMethod] = useState<'primal' | 'dual'>('primal');
  const [currentIteration, setCurrentIteration] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Récupérer le problème depuis localStorage
    try {
      const storedProblem = localStorage.getItem('simplexProblem');
      if (storedProblem) {
        const parsedProblem = JSON.parse(storedProblem) as Problem;
        setProblem(parsedProblem);
        setLoading(false);
      } else {
        setError('Aucun problème trouvé. Veuillez définir un problème.');
        setLoading(false);
      }
    } catch (err) {
      setError('Erreur lors de la récupération du problème.');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (problem) {
      // Définir automatiquement la méthode en fonction du type d'objectif
      const appropriateMethod = problem.objective.type === 'max' ? 'primal' : 'dual';
      setMethod(appropriateMethod);
      solveProblem(appropriateMethod);
    }
  }, [problem]);

  const solveProblem = (methodToUse: 'primal' | 'dual' = method) => {
    if (!problem) return;
    
    try {
      let result;
      if (methodToUse === 'primal') {
        result = solveWithSimplexe(problem);
      } else {
        result = solveWithDualSimplexe(problem);
      }
      
      setResult(result);
      setCurrentIteration(0);
    } catch (err) {
      setError('Erreur lors de la résolution du problème.');
    }
  };


  const handleIterationChange = (index: number) => {
    if (result && index >= 0 && index < result.iterations.length) {
      setCurrentIteration(index);
    }
  };

  const renderTableau = (tableau: Tableau, iteration: SimplexeIteration) => {
    const { pivotRow, pivotColumn } = iteration;
    
    return (
      <div className="overflow-x-auto mt-4 border rounded-lg p-4 bg-white shadow-sm">
        <table className="simplexe-table w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Base</th>
              {iteration.nonBasicVariables.map((variable, index) => (
                <th key={`header-${index}`} className={`p-2 border ${pivotColumn === index ? 'bg-blue-100' : ''}`}>
                  {variable}
                </th>
              ))}
              <th className="p-2 border">RHS</th>
            </tr>
          </thead>
          <tbody>
            {/* Ligne de la variable objectif (Z) en premier */}
            <tr className="bg-gray-50">
              <td className="p-2 border font-bold">Z</td>
              {tableau[tableau.length - 1].slice(0, -1).map((cell, cellIndex) => (
                <td 
                  key={`z-cell-${cellIndex}`}
                  className={`p-2 border text-right ${pivotColumn === cellIndex ? 'bg-blue-100' : ''}`}
                >
                  {cell !== null && !isNaN(cell) ? cell.toFixed(2) : '0.00'}
                </td>
              ))}
              <td className="p-2 border font-bold text-right">
                {tableau[tableau.length - 1][tableau[0].length - 1] !== null && 
                 !isNaN(tableau[tableau.length - 1][tableau[0].length - 1]) ? 
                 tableau[tableau.length - 1][tableau[0].length - 1].toFixed(2) : '0.00'}
              </td>
            </tr>
            
            {/* Autres lignes du tableau */}
            {tableau.slice(0, -1).map((row, rowIndex) => (
              <tr key={`row-${rowIndex}`} className={pivotRow === rowIndex ? 'bg-blue-50' : ''}>
                <td className="p-2 border font-bold">{iteration.basicVariables[rowIndex]}</td>
                {row.slice(0, -1).map((cell, cellIndex) => (
                  <td 
                    key={`cell-${rowIndex}-${cellIndex}`}
                    className={`p-2 border text-right ${
                      (pivotRow === rowIndex && pivotColumn === cellIndex) ? 'bg-yellow-200 font-bold' :
                      (pivotRow === rowIndex || pivotColumn === cellIndex) ? 'bg-blue-100' : ''
                    }`}
                  >
                    {cell !== null && !isNaN(cell) ? cell.toFixed(2) : '0.00'}
                  </td>
                ))}
                <td className="p-2 border text-right">
                  {row[row.length - 1] !== null && !isNaN(row[row.length - 1]) ? 
                   row[row.length - 1].toFixed(2) : '0.00'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderIterationDetails = (iteration: SimplexeIteration) => {
    return (
      <div className="bg-blue-50 p-4 rounded-lg mb-4 border-l-4 border-blue-500">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">
          {iteration.isOptimal 
            ? "Solution optimale trouvée" 
            : iteration.isUnbounded 
              ? "Problème non borné détecté" 
              : `Détails de l'itération ${currentIteration}`}
        </h3>
        
        <div className="space-y-2">
          {iteration.isOptimal ? (
            <p className="text-green-700">
              <span className="font-bold">Explication:</span> Toutes les variables d'écart sont positives ou nulles et tous les coefficients de la fonction objectif sont négatifs ou nuls.
            </p>
          ) : iteration.isUnbounded ? (
            <p className="text-yellow-700">
              <span className="font-bold">Explication:</span> Il existe une colonne avec un coefficient positif dans la fonction objectif, mais tous les éléments de cette colonne sont négatifs ou nuls.
            </p>
          ) : (
            <>
              {iteration.enteringVariable && (
                <p className="text-blue-700">
                  <span className="font-bold">Variable entrante:</span> {iteration.enteringVariable} 
                  <span className="text-blue-500 ml-2">(colonne {iteration.pivotColumn + 1})</span>
                </p>
              )}
              
              {iteration.leavingVariable && (
                <p className="text-blue-700">
                  <span className="font-bold">Variable sortante:</span> {iteration.leavingVariable} 
                  <span className="text-blue-500 ml-2">(ligne {iteration.pivotRow + 1})</span>
                </p>
              )}
              
              {iteration.pivotElement !== null && (
                <p className="text-blue-700">
                  <span className="font-bold">Élément pivot:</span> {iteration.pivotElement.toFixed(2)} 
                  <span className="text-blue-500 ml-2">à la position ({iteration.pivotRow + 1}, {iteration.pivotColumn + 1})</span>
                </p>
              )}
            </>
          )}
        </div>
        
        {iteration.explanation && (
          <div className="mt-3 pt-3 border-t border-blue-200">
            <p className="text-blue-600 italic">{iteration.explanation}</p>
          </div>
        )}
      </div>
    );
  };

  const renderSolution = () => {
    if (!result || !result.optimal) return null;
    
    const solution = result.solution;
    const objectiveValue = result.objectiveValue;
    
    // Filtrer les variables de décision (x) et les variables d'écart (s)
    const decisionVars = Object.entries(solution).filter(([key]) => key.startsWith('x'));
    const slackVars = Object.entries(solution).filter(([key]) => key.startsWith('s'));
    
    return (
      <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-500 mb-8">
        <h3 className="text-xl font-bold text-green-800 mb-4">Solution optimale</h3>
        
        {/* Valeur de la fonction objectif */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6 border border-green-200">
          <h4 className="text-lg font-semibold text-green-700 mb-2">Valeur de la fonction objectif</h4>
          <div className="text-center py-3 bg-green-100 rounded-lg">
            <span className="text-2xl font-bold text-green-800">
              Z{problem?.objective.type === 'max' ? 'max' : 'min'} = {objectiveValue !== null && !isNaN(objectiveValue) ? objectiveValue.toFixed(4) : '0.0000'}
            </span>
          </div>
        </div>
        
        {/* Variables de décision */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-green-700 mb-3">Variables de décision</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {decisionVars.map(([key, value]) => (
              <div key={key} className="bg-white p-4 rounded-lg shadow-sm border border-green-200 hover:shadow-md transition-all">
                <div className="text-sm text-green-600 mb-1">Variable</div>
                <div className="text-xl font-bold text-green-800 mb-1">{key}</div>
                <div className="text-lg">{value !== null && !isNaN(value) ? value.toFixed(4) : '0.0000'}</div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Variables d'écart */}
        {slackVars.length > 0 && (
          <div>
            <h4 className="text-lg font-semibold text-green-700 mb-3">Variables d'écart</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {slackVars.map(([key, value]) => (
                <div key={key} className="bg-white p-4 rounded-lg shadow-sm border border-green-200 hover:shadow-md transition-all">
                  <div className="text-sm text-green-600 mb-1">Variable d'écart</div>
                  <div className="text-xl font-bold text-green-800 mb-1">{key}</div>
                  <div className="text-lg">{value !== null && !isNaN(value) ? value.toFixed(4) : '0.0000'}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <button 
          onClick={() => router.push('/')} 
          className="btn-primary"
        >
          Retour à l'accueil
        </button>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card">
          <h2 className="card-title">Aucun problème défini</h2>
          <p className="mb-4">Veuillez définir un problème de programmation linéaire pour continuer.</p>
          <button 
            onClick={() => router.push('/')} 
            className="btn-primary"
          >
            Définir un problème
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card">
        <h2 className="card-title">Résolution par la méthode du simplexe</h2>
        
        <div className="bg-blue-50 p-4 rounded-lg mb-6 border-l-4 border-blue-500">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Méthode utilisée</h3>
          <p className="text-blue-700">
            {problem.objective.type === 'max' ? (
              <>
                <span className="font-bold">Simplexe primal</span> - Recommandé pour les problèmes de maximisation
              </>
            ) : (
              <>
                <span className="font-bold">Simplexe dual</span> - Recommandé pour les problèmes de minimisation
              </>
            )}
          </p>
        </div>
        
        {result && (
          <>
            <div className="mb-6">
              <h3 className="text-lg font-bold text-blue-700 mb-2">Navigation des itérations</h3>
              <div className="flex flex-wrap gap-2">
                {result.iterations.map((_, index) => (
                  <button
                    key={`iter-${index}`}
                    onClick={() => handleIterationChange(index)}
                    className={`px-3 py-1 rounded border ${
                      currentIteration === index 
                        ? 'bg-blue-500 text-white border-blue-600' 
                        : 'bg-white text-blue-500 border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    {index === 0 ? 'Initial' : `${index}`}
                  </button>
                ))}
              </div>
            </div>
            
            {result.iterations[currentIteration] && (
              <div className="mb-6">
                {renderTableau(
                  result.iterations[currentIteration].tableau,
                  result.iterations[currentIteration]
                )}
              </div>
            )}
            
            {result.iterations[currentIteration] && (
              <div className="mb-6">
                {renderIterationDetails(result.iterations[currentIteration])}
              </div>
            )}
            
            {result.optimal && currentIteration === result.iterations.length - 1 && renderSolution()}
            
            {result.unbounded && (
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
                Le problème est non borné. La fonction objectif peut prendre des valeurs arbitrairement grandes.
              </div>
            )}
            
            {result.infeasible && (
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
                Le problème est infaisable. Il n'existe pas de solution respectant toutes les contraintes.
              </div>
            )}
          </>
        )}
        
        <div className="flex justify-between mt-8">
          <button 
            onClick={() => router.push('/problem')} 
            className="btn-secondary"
          >
            Modifier le problème
          </button>
          <button 
            onClick={() => router.push('/')} 
            className="btn-secondary"
          >
            Nouveau problème
          </button>
        </div>
      </div>
    </div>
  );
}
