"use client";
import { useState } from "react";
import { useEffect } from "react";
import SaisieAnonymat from "./saisieAnonymat";
import SaisieNotesSousAnonymat from "./saisieNotesSousAnonymat";
import PeriodeActive from "../periodeActive";
import {useAuth} from "@/contexts/AuthContext";

export default function EvaluationExamen({ueId,evaluations, evaluation, etudiants, setEtudiants, calculerMoyenne, annee, semestre, annee_id }) {
  const [phase, setPhase] = useState("anonymat");
  const periodeActive = PeriodeActive();
  const { user } = useAuth();
  const [role, setRole] = useState("");


  // Charger rôle depuis localStorage
  useEffect(() => {
    const storedRole = user.role;
    if (storedRole) {
      setRole(storedRole);
    }
  }, []);

  return (role === "secretaire" && phase === "anonymat") ? (
    <SaisieAnonymat
      ueId={ueId}
      etudiants={etudiants}
      setEtudiants={setEtudiants}
      annee_id={annee_id}
      evaluations={evaluations}
      evaluation={evaluation}
      annee={annee}
      semestre={semestre}
      periodeActive={periodeActive}
      onNext={() => setPhase("notes")}
    />
  ) : (
    <SaisieNotesSousAnonymat
      etudiants={etudiants}
      setEtudiants={setEtudiants}
      evaluation={evaluation}
      evaluations={evaluations}
      calculerMoyenne={calculerMoyenne}
      annee={annee}
      semestre={semestre}
      periodeActive={periodeActive}
    />
  );
}
