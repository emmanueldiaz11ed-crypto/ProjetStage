import React from "react";
  import { GraduationCap, Laptop} from "lucide-react";

export default function Programmes() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 px-4 py-16 flex flex-col items-center">
      <div className="max-w-5xl w-full text-center mb-12">
        <h1 className="text-4xl font-extrabold text-blue-900 mb-4">Nos Programmes</h1>
        <p className="text-gray-600 text-lg">
          Découvrez nos formations d’excellence, alliant théorie et pratique, dans divers domaines du génie.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 w-full max-w-5xl">
        {/* Licence */}
        <div className="bg-white shadow-lg rounded-2xl p-6">
          <h2 className="text-xl font-bold text-blue-800 mb-4 flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-blue-500" />
            Licence Professionnelle
          </h2>
          <ul className="text-gray-700 space-y-3 text-left">
            <li>
              <span className="font-semibold text-blue-700">Génie Logiciel</span> – 3 ans : développement logiciel, algorithmique, bases de données.
            </li>
            <li>
              <span className="font-semibold text-blue-700">Systèmes et Réseaux Informatiques</span> – 3 ans : réseaux, systèmes, sécurité informatique.
            </li>
            <li>
              <span className="font-semibold text-blue-700">Génie Civil</span> – 3 ans : structures, matériaux, chantiers.
            </li>
            <li>
              <span className="font-semibold text-blue-700">Génie Électrique</span> – 3 ans : électricité, électronique, automatismes.
            </li>
          </ul>
        </div>

        {/* Master */}
        <div className="bg-white shadow-lg rounded-2xl p-6">
          <h2 className="text-xl font-bold text-blue-800 mb-4 flex items-center gap-2">
            <Laptop className="w-6 h-6 text-blue-500" />
            Master Ingénieur
          </h2>
          <ul className="text-gray-700 space-y-3 text-left">
            <li>
              <span className="font-semibold text-blue-700">Génie Informatique</span> – 3ans : Formation de base  - 2 ans : spécialisation avancée, recherche, projets innovants.
            </li>
            <li>
              <span className="font-semibold text-blue-700">Génie Électrique</span> – 3 ans : formation de base - 2 ans : spécialisation avancée, recherche, projets innovants.
            </li>

          </ul>
        </div>
        
        {/* Master de recherche */}
        <div className="bg-white shadow-lg rounded-2xl p-6 md:col-span-2">
          <h2 className="text-xl font-bold text-blue-800 mb-4 flex items-center gap-2">
            <Laptop className="w-6 h-6 text-blue-500" />
            Master de Recherche
          </h2>
          <ul className="text-gray-700 space-y-3 text-left">
            <li>
              <span className="font-semibold text-blue-700">Génie Informatique</span> – 3ans : Formation de base  - 2 ans : spécialisation avancée, recherche, projets innovants.
            </li>
           
          </ul>
        </div>
      </div>
      

      <footer className="mt-16 text-center text-gray-500 text-sm">
        Université de Lomé – EPL &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
