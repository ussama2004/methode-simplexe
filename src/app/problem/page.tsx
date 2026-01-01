'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ProblemForm } from '../../components/ProblemForm';

export default function ProblemPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [numVars, setNumVars] = useState<number>(2);
  const [numConstraints, setNumConstraints] = useState<number>(2);
  
  useEffect(() => {
    const vars = searchParams?.get('vars');
    const constraints = searchParams?.get('constraints');
    
    if (vars) setNumVars(parseInt(vars));
    if (constraints) setNumConstraints(parseInt(constraints));
  }, [searchParams]);
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="card">
        <h2 className="card-title">Définition du problème de programmation linéaire</h2>
        <p className="mb-6 text-gray-700">
          Veuillez définir votre problème de programmation linéaire en spécifiant la fonction objectif
          et les contraintes.
        </p>
        
        <ProblemForm 
          numVars={numVars} 
          numConstraints={numConstraints} 
        />
      </div>
    </div>
  );
}
