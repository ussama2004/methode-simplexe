'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [numVariables, setNumVariables] = useState<number>(2);
  const [numConstraints, setNumConstraints] = useState<number>(2);
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (numVariables < 1 || numConstraints < 1) {
      setError('Le nombre de variables et de contraintes doit être supérieur à 0');
      return;
    }
    
    if (numVariables > 10 || numConstraints > 10) {
      setError('Pour des raisons de performance, limitez le nombre de variables et de contraintes à 10');
      return;
    }
    
    router.push(`/problem?vars=${numVariables}&constraints=${numConstraints}`);
  };

  const handleUseExample = () => {
    setNumVariables(2);
    setNumConstraints(3);
    localStorage.setItem('useExample', 'true');
    router.push(`/problem?vars=2&constraints=3`);
  };

  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-blue-50">
      <div className="max-w-6xl mx-auto">
        {/* En-tête avec animation */}
        <div className="text-center mb-12 transform hover:scale-105 transition-transform duration-500">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
            Méthode du Simplexe
          </h1>
          <p className="text-xl max-w-3xl mx-auto" style={{color: 'rgba(var(--foreground-rgb), 0.8)'}}>
            Un outil puissant pour résoudre vos problèmes d'optimisation linéaire
          </p>
        </div>
        
        {/* Cartes d'information avec effets au survol */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="card hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-t-4" 
               style={{borderTopColor: 'rgba(var(--primary-color), 1)'}}>
            <div className="flex items-center mb-4">
              <div className="rounded-full p-3 mr-4" style={{backgroundColor: 'rgba(var(--primary-light), 0.2)'}}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" style={{color: 'rgba(var(--primary-color), 1)'}} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h2 className="card-title mb-0">Qu'est-ce que la méthode du simplexe ?</h2>
            </div>
            <p className="mb-4 leading-relaxed">
              La méthode du simplexe est un algorithme d'optimisation utilisé pour résoudre des problèmes de programmation linéaire. 
              Elle permet de trouver la valeur optimale (maximale ou minimale) d'une fonction objectif linéaire, sous réserve de contraintes linéaires.
            </p>
            <p className="leading-relaxed">
              Cette application vous permet de résoudre des problèmes de programmation linéaire en utilisant soit la méthode du simplexe primal, 
              soit la méthode du simplexe dual, selon la nature de votre problème.
            </p>
            <div className="mt-6 space-y-3">
              <div className="flex items-center">
                <div className="rounded-full h-2 w-2 mr-2" style={{backgroundColor: 'rgba(var(--primary-color), 1)'}}></div>
                <span>Suivi pas à pas des itérations</span>
              </div>
              <div className="flex items-center">
                <div className="rounded-full h-2 w-2 mr-2" style={{backgroundColor: 'rgba(var(--primary-color), 1)'}}></div>
                <span>Visualisation des tableaux du simplexe</span>
              </div>
              <div className="flex items-center">
                <div className="rounded-full h-2 w-2 mr-2" style={{backgroundColor: 'rgba(var(--primary-color), 1)'}}></div>
                <span>Explication détaillée de chaque étape</span>
              </div>
            </div>
          </div>
          
          <div className="card hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-t-4" 
               style={{borderTopColor: 'rgba(var(--accent-color), 1)'}}>
            <div className="flex items-center mb-4">
              <div className="rounded-full p-3 mr-4" style={{backgroundColor: 'rgba(var(--accent-color), 0.2)'}}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" style={{color: 'rgba(var(--accent-color), 1)'}} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l4.879-4.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242z" />
                </svg>
              </div>
              <h2 className="card-title mb-0">Quelle méthode choisir ?</h2>
            </div>
            <div className="mb-4 p-3 rounded-lg" style={{backgroundColor: 'rgba(var(--primary-light), 0.05)'}}>
              <p className="font-medium mb-2" style={{color: 'rgba(var(--primary-dark), 1)'}}>
                Méthode du simplexe primal :
              </p>
              <p className="pl-4 border-l-2" style={{borderColor: 'rgba(var(--primary-color), 0.5)'}}>
                Idéale pour les problèmes de maximisation avec des contraintes de type ≤.
              </p>
            </div>
            <div className="mb-4 p-3 rounded-lg" style={{backgroundColor: 'rgba(var(--accent-color), 0.05)'}}>
              <p className="font-medium mb-2" style={{color: 'rgba(var(--accent-color), 0.9)'}}>
                Méthode du simplexe dual :
              </p>
              <p className="pl-4 border-l-2" style={{borderColor: 'rgba(var(--accent-color), 0.5)'}}>
                Préférable pour les problèmes de minimisation avec des contraintes de type ≥.
              </p>
            </div>
            <div className="mt-4 p-3 rounded-lg bg-green-50 border-l-4 border-green-400">
              <p className="text-green-800">
                Ne vous inquiétez pas, l'application choisira automatiquement la méthode la plus appropriée en fonction de votre problème.
              </p>
            </div>
          </div>
        </div>
        
        {/* Formulaire de saisie avec design amélioré */}
        <div className="card mb-8 hover:shadow-xl transition-all duration-300">
          <h2 className="card-title flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" style={{color: 'rgba(var(--primary-color), 1)'}} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            Commencer la résolution
          </h2>
          
          <p className="mb-6" style={{color: 'rgba(var(--foreground-rgb), 0.8)'}}>
            Pour débuter la résolution de votre problème de programmation linéaire, veuillez indiquer le nombre de variables de décision 
            et le nombre de contraintes de votre problème.
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-6 p-6 rounded-lg" style={{backgroundColor: 'rgba(var(--primary-light), 0.05)'}}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="numVariables" className="label flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" style={{color: 'rgba(var(--primary-color), 0.8)'}} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.871 4A17.926 17.926 0 003 12c0 2.874.673 5.59 1.871 8m14.13 0a17.926 17.926 0 001.87-8c0-2.874-.673-5.59-1.87-8M9 9h1.246a1 1 0 01.961.725l1.586 5.55a1 1 0 00.961.725H15m1-7h-.08a2 2 0 00-1.519.698L9.6 15.302A2 2 0 018.08 16H8" />
                  </svg>
                  Nombre de variables de décision
                </label>
                <input
                  id="numVariables"
                  type="number"
                  min="1"
                  max="10"
                  value={numVariables === 0 ? '' : numVariables}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '') {
                      setNumVariables(0);
                    } else {
                      setNumVariables(parseInt(value) || 0);
                    }
                  }}
                  className="input-field w-full"
                />
              </div>
              
              <div>
                <label htmlFor="numConstraints" className="label flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" style={{color: 'rgba(var(--accent-color), 0.8)'}} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Nombre de contraintes
                </label>
                <input
                  id="numConstraints"
                  type="number"
                  min="1"
                  max="10"
                  value={numConstraints === 0 ? '' : numConstraints}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '') {
                      setNumConstraints(0);
                    } else {
                      setNumConstraints(parseInt(value) || 0);
                    }
                  }}
                  className="input-field w-full"
                />
              </div>
            </div>
            
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p>{error}</p>
                </div>
              </div>
            )}
            
            <div className="flex justify-between items-center">
              <button 
                type="button" 
                onClick={handleUseExample}
                className="btn-secondary flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Utiliser un exemple
              </button>
              <button type="submit" className="btn-primary flex items-center group">
                <span>Continuer</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
