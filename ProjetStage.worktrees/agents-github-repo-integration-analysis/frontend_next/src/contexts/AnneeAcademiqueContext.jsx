"use client";
import { createContext, useContext, useEffect, useState } from "react";
import anneeAcademiqueService from "@/services/anneeAcademiqueService";

const AnneeAcademiqueContext = createContext();

export function AnneeAcademiqueProvider({ children }) {
  const [annee, setAnnee] = useState(null);
  const [anneeObject, setAnneeObject] = useState({});


console.log("AnneeAcademiqueContext - annee:", annee);
  // Charger depuis localStorage au démarrage
  useEffect(() => {
    const stored = localStorage.getItem("annee_id");
    if (stored) {
      setAnnee(Number(stored));  
    }
  }, []);

  // Synchroniser avec localStorage quand annee change
  useEffect(() => {
    if (annee !== null) {
      localStorage.setItem("annee_id", annee.id);
    }
  }, [annee]);
  
  // Récupérer l"année académique à partir de son id
  useEffect(() => {
    if (annee !== null) {
      anneeAcademiqueService.getAnneeAcademiqueById(annee.id)
        .then((annee) => setAnneeObject(annee))
        .catch((error) => console.error("Erreur lors du chargement de l'année académique :", error));
    }
  }, [annee]);

  return (
    <AnneeAcademiqueContext.Provider value={{ annee, setAnnee, anneeObject}}>
      {children}
    </AnneeAcademiqueContext.Provider>
  );
}

export function useAnneeAcademique() {
  const context = useContext(AnneeAcademiqueContext);
  if (context === undefined) {
    throw new Error('useAnneeAcademique doit être utilisé dans AnneeAcademiqueProvider');
  }
  return context;
}