"use client";

import React, { useState, useEffect } from "react";
import PeriodeSaisieService from "@/services/periodeSaisieService";

function formatDateForDisplay(dateStr) {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}

export default function PeriodeSaisie() {
  const [periodes, setPeriodes] = useState([]);

  useEffect(() => {
    const fetchPeriodes = async () => {
      try {
        const data = await PeriodeSaisieService.getAll();
        setPeriodes(data);
      } catch (error) {
        console.error("Erreur lors du chargement :", error);
      }
    };
    fetchPeriodes();
  }, []);

  return (
    <div className="p-6 bg-white rounded-xl shadow-md text-black">
      <h2 className="text-xl font-bold text-blue-800 mb-4">
        Périodes de saisie de notes
      </h2>

      <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
        <thead className="bg-blue-50">
          <tr>
            <th className="px-4 py-2 border">Numéro</th>
            <th className="px-4 py-2 border">Date début</th>
            <th className="px-4 py-2 border">Date fin</th>
          </tr>
        </thead>
        <tbody>
          {periodes.map((periode) => (
            <tr key={periode.id} className="text-center hover:bg-blue-50">
              <td className="px-4 py-2 border">{periode.numero}</td>
              <td className="px-4 py-2 border">{formatDateForDisplay(periode.date_debut)}</td>
              <td className="px-4 py-2 border">{formatDateForDisplay(periode.date_fin)}</td>
            </tr>
          ))}
          {periodes.length === 0 && (
            <tr>
              <td colSpan="3" className="px-4 py-3 text-gray-500 text-center italic">
                Aucune période créée.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}