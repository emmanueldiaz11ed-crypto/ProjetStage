"use client";
import { useState } from "react";
import { getCompare, getFigureUrl } from "@/services/eplApi";

const columns = [
  { label: "Entité", key: "nom" },
  { label: "Effectif", key: "effectif" },
  { label: "Moyenne", key: "moyenne" },
  { label: "Taux réussite", key: "taux_reussite", percent: true },
  { label: "Nb UEs", key: "nb_ues" },
];

export default function VueComparaison() {
  const [typeE, setTypeE] = useState("filiere");
  const [entites, setEntites] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!typeE) return;
    setLoading(true);
    try {
      const res = await getCompare({ type: typeE, entites });
      setData(res);
    } catch (e) {
      console.error(e);
      setData(null);
    }
    setLoading(false);
  };

  const figureParams = { type: typeE, entites };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Vue Comparaison</h1>
      <div className="grid gap-4 md:grid-cols-[1fr_auto] items-end mb-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <select
            value={typeE}
            onChange={(e) => setTypeE(e.target.value)}
            className="border rounded-lg px-3 py-2"
          >
            <option value="filiere">Filière</option>
            <option value="departement">Département</option>
            <option value="ue">UE</option>
          </select>
          <input
            value={entites}
            onChange={(e) => setEntites(e.target.value)}
            placeholder="entite1,entite2"
            className="rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>
        <button
          onClick={load}
          className="inline-flex items-center justify-center rounded-lg bg-blue-700 px-5 py-2 text-white hover:bg-blue-800 transition"
        >
          Comparer
        </button>
      </div>

      {loading && <div className="mb-4 text-sm text-gray-600">Chargement...</div>}

      {data ? (
        <>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm mb-8">
            <h2 className="text-lg font-semibold mb-4">Résumé de comparaison</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    {columns.map((col) => (
                      <th key={col.key} className="px-3 py-2">{col.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.entites?.map((row, index) => (
                    <tr key={index} className="border-t border-slate-200">
                      {columns.map((col) => (
                        <td key={col.key} className="px-3 py-2">
                          {row[col.key] != null
                            ? col.percent
                              ? `${Number(row[col.key]).toFixed(1)} %`
                              : row[col.key]
                            : "-"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {data.entites?.map((row, index) => {
              const keyParam = typeE === "ue" ? "ue" : typeE === "departement" ? "departement" : "filiere";
              const params = { [keyParam]: row.nom };
              return (
                <div key={index} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="mb-3 text-sm font-semibold text-slate-600">{row.nom || row.nom_prenoms || `Entité ${index + 1}`}</div>
                  <img
                    src={getFigureUrl("boxplot", params)}
                    alt={`Boxplot ${row.nom}`}
                    className="h-72 w-full rounded-xl object-contain border border-slate-200 bg-slate-50"
                  />
                </div>
              );
            })}
          </div>
        </>
      ) : (
        !loading && <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">Saisissez des entités pour comparer et cliquez sur Comparer.</div>
      )}
    </div>
  );
}
