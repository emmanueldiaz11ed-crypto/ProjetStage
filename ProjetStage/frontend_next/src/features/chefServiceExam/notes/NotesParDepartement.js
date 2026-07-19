"use client";
import { useEffect, useState } from "react";
import departementService from "@/services/departementService";
import UeService from "@/services/ueService";
import { AlertTriangle, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
import {useAnneeAcademique } from "@/contexts/AnneeAcademiqueContext";

export default function DashboardControleNotes() {

  const [departements, setDepartements] = useState([]);
  const [progressions, setProgressions] = useState([]);
  const [openDep, setOpenDep] = useState(null);
  const { annee } = useAnneeAcademique();
  
  const fetchData = async () => {
    try {

      const deps = await departementService.getDepartements();
      const progress = await UeService.getPourcentageUEsSaisiesByDepartement(annee.id);

      setDepartements(deps);
      setProgressions(progress);

    } catch (error) {
      console.error("Erreur chargement dashboard", error);
    }
  };

  const getProgression = (depId) => {
    return progressions.find(p => p.departement_id === depId);
  };

  const toggleDep = (depId) => {
    if (openDep === depId) {
      setOpenDep(null);
    } else {
      setOpenDep(depId);
    }
  };
  useEffect(() => {
  if (annee) {
    fetchData();
  }
}, [annee]);

  return (
    <div className="p-6">

      <h2 className="text-2xl font-bold mb-6 ">
        Tableau de bord 
      </h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 ">

        {departements.map(dep => {

          const progression = getProgression(dep.id);
          const pourcentage = progression ? progression.pourcentage : 0;

          const uesManquantes = progression
            ? progression.ues.filter(u => u.etat_global !== "complet")
            : [];

          return (

            <div
              key={dep.id}
              className="bg-white shadow-lg rounded-xl p-5 hover:shadow-xl transition"
            >

              {/* HEADER */}
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleDep(dep.id)}
              >

                <h3 className="font-semibold text-lg">
                  {dep.nom}
                </h3>

                <div className="flex items-center gap-2">
                {/*Alert triangle green if 100% else if 0% red else if < 100% orange*/}
                  {pourcentage === 100 ? (
                    <CheckCircle className="text-green-500"/>
                  ) : pourcentage === 0 ? (
                    <AlertTriangle className="text-red-500"/>
                  ) : (
                    <AlertTriangle className="text-orange-500"/>
                  )
                  }

                  {openDep === dep.id ? <ChevronUp/> : <ChevronDown/>}

                </div>

              </div>

              {/* PROGRESS BAR */}

              <div className="mt-4">

                <div className="w-full bg-gray-200 rounded-full h-3">

                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all"
                    style={{ width: `${pourcentage}%` }}
                  />

                </div>

                <p className="text-sm text-gray-500 mt-1">
                  {pourcentage}% des notes saisies
                </p>

              </div>

              {/* UE MANQUANTES */}

              {openDep === dep.id && uesManquantes.length > 0 && (

                <div className="mt-4 border-t pt-3">

                  <p className="text-sm font-semibold text-red-500 mb-2">
                    UE avec notes manquantes
                  </p>

                  <ul className="space-y-1">

                    {uesManquantes.map(ue => (

                      <li
                        key={ue.ue_id}
                        className="text-sm flex justify-between"
                      >

                        <span>
                          {ue.ue_code} - {ue.ue_libelle}
                        </span>

                        <span className="text-red-500">
                          incomplet
                        </span>

                      </li>

                    ))}

                  </ul>

                </div>

              )}

            </div>
          );
        })}

      </div>

    </div>
  );
}