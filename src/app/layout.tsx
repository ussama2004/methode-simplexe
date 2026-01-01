/*
  Copyright (c) 2025 Oussama Bouhadef (sigl1).
  All rights reserved.

  Layout file authored by Oussama Bouhadef (sigl1).
*/

import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Méthode Simplexe',
  description: 'Application pour résoudre des problèmes de programmation linéaire par la méthode du simplexe',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>
        <div className="min-h-screen bg-white">
          <header className="bg-blue-600 text-white p-4 shadow-md">
            <div className="container mx-auto">
              <h1 className="text-2xl font-bold">Méthode Simplexe</h1>
              <p className="text-blue-100">Résolution de problèmes de programmation linéaire</p>
            </div>
          </header>
          <main className="container mx-auto py-8 px-4">
            {children}
          </main>
          <footer className="bg-blue-600 text-white p-4 mt-8">
            <div className="container mx-auto text-center">
              <p>© {new Date().getFullYear()} - Application Méthode Simplexe</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
