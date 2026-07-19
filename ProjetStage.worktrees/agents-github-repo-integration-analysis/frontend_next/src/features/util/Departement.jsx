"use client";

import { useEffect, useState } from "react";
import DepartementService from "@/services/departementService";
export default function DepartementSelect({ onSelect, value }) {
  const [departements, setDepartements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDepartements = async () => {
      try {
        const data = await DepartementService.getDepartements();
        setDepartements(data);
      } catch (error) {
        console.error("Erreur chargement départements :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartements();
  }, []);
  const handleChange = (e) => {
    const selectedId = Number(e.target.value);
    const selectedObject = departements.find(
      (dep) => dep.id === selectedId
    );

    if (onSelect) {
      onSelect(selectedObject);
    }
  };


  return (
    <select
      value={value?.id || ""}
      onChange={handleChange}
      className="border px-3 py-4 border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
    >
      {departements.map((dep) => (
        <option key={dep.id} value={dep.id}>
          {dep.nom}
        </option>
      ))}
    </select>
  );
}
