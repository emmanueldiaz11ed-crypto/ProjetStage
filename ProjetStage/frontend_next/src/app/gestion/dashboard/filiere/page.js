"use client";
import { useState, useEffect } from "react";
import { getDisponibilites, getDashboardAggregates, getFigureUrl } from "@/services/eplApi";

const statTiles = [
  { label: "Moyenne", field: "moyenne_global" },
  { label: "Taux de réussite", field: "taux_reussite_global", percent: true },
  { label: "Effectif", field: "effectif_exact" },
  { label: "Médiane", field: "mediane" },
  { label: "Q1", field: "q1" },
  { label: "Q3", field: "q3" },
  { label: "IQR", field: "iqr" },
];

export default function VueFiliere() {
  const [filters, setFilters] = useState({ filiere: "", annee: "" });
  const [options, setOptions] = useState({ filieres: [], annees: [] });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const o = await getDisponibilites();
        setOptions(o);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getDashboardAggregates(filters);
      setData(res);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const figureParams = { ...filters };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Vue Filière</h1>

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <select
          value={filters.filiere}
          onChange={(e) => setFilters({ ...filters, filiere: e.target.value })}
          className="border rounded-lg px-3 py-2"
        >
          <option value="">Filière</option>
          {options.filieres?.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
        <select
          value={filters.annee}
          onChange={(e) => setFilters({ ...filters, annee: e.target.value })}
          className="border rounded-lg px-3 py-2"
        >
          <option value="">Année</option>
          {options.annees?.map((annee) => (
            <option key={annee} value={annee}>{annee}</option>
          ))}
        </select>
        <button
          onClick={load}
          className="inline-flex items-center justify-center rounded-lg bg-blue-700 px-4 py-2 text-white hover:bg-blue-800 transition"
        >
          Charger
        </button>
      </div>

      {loading && <div className="mb-4 text-sm text-gray-600">Chargement...</div>}

      {data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
            {statTiles.map((tile) => (
              <div key={tile.field} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="text-sm text-slate-500 mb-2">{tile.label}</div>
                <div className="text-3xl font-semibold text-slate-900">
                  {data[tile.field] != null
                    ? tile.percent
                      ? `${Number(data[tile.field]).toFixed(1)} %`
                      : Number(data[tile.field]).toFixed(2)
                    : "-"}
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2 mb-8">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">UE difficiles</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-3 py-2">UE</th>
                      <th className="px-3 py-2">Moyenne</th>
                      <th className="px-3 py-2">Taux réussite</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.ue_difficiles?.slice(0, 8).map((row, index) => (
                      <tr key={index} className="border-t border-slate-200">
                        <td className="px-3 py-2">{row.ue || row.nom || "-"}</td>
                        <td className="px-3 py-2">{row.moyenne?.toFixed?.(2) ?? "-"}</td>
                        <td className="px-3 py-2">{row.taux_reussite != null ? `${row.taux_reussite.toFixed(1)} %` : "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Étudiants à risque</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-3 py-2">Étudiant</th>
                      <th className="px-3 py-2">Filière</th>
                      <th className="px-3 py-2">Taux réussite</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.risques?.slice(0, 8).map((row, index) => (
                      <tr key={index} className="border-t border-slate-200">
                        <td className="px-3 py-2">{row.nom_prenoms || row.anonymat || "-"}</td>
                        <td className="px-3 py-2">{row.filiere || "-"}</td>
                        <td className="px-3 py-2">{row.taux_reussite != null ? `${row.taux_reussite.toFixed(1)} %` : "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 text-sm font-semibold text-slate-600">Évolution de la moyenne par sexe</div>
              <img
                src={getFigureUrl("courbe_moyenne_par_sexe", figureParams)}
                alt="Évolution moyenne par sexe"
                className="h-72 w-full rounded-xl object-contain border border-slate-200 bg-slate-50"
              />
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 text-sm font-semibold text-slate-600">Distribution par sexe (boxplot)</div>
              <img
                src={getFigureUrl("boxplot_by_sex", figureParams)}
                alt="Boxplot par sexe"
                className="h-72 w-full rounded-xl object-contain border border-slate-200 bg-slate-50"
              />
            </div>
          </div>
        </>
      ) : (
        !loading && <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">Pas de données pour cette filière.</div>
      )}
    </div>
  );
}
