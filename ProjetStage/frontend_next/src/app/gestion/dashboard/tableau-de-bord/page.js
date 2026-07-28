"use client";
import { useEffect, useState } from "react";
import { getDashboardAggregates, getDisponibilites, getFigureUrl } from "@/services/eplApi";

const metricDefinitions = [
  { label: "Moyenne générale", field: "moyenne_global", format: (v) => (v != null ? v.toFixed(2) : "-") },
  { label: "Taux de réussite", field: "taux_reussite_global", format: (v) => (v != null ? `${v.toFixed(1)} %` : "-") },
  { label: "Effectif", field: "effectif_exact", format: (v) => (v != null ? v : "-") },
  { label: "Médiane", field: "mediane", format: (v) => (v != null ? v.toFixed(2) : "-") },
  { label: "Q1", field: "q1", format: (v) => (v != null ? v.toFixed(2) : "-") },
  { label: "Q3", field: "q3", format: (v) => (v != null ? v.toFixed(2) : "-") },
  { label: "IQR", field: "iqr", format: (v) => (v != null ? v.toFixed(2) : "-") },
];

export default function VueGlobale() {
  const [filters, setFilters] = useState({ annee: "", semestre: "" });
  const [options, setOptions] = useState({ annees: [], semestres: [] });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadOptions(); loadData(); }, []);

  async function loadOptions() {
    try {
      const resp = await getDisponibilites();
      setOptions(resp);
    } catch (e) { console.error(e); }
  }

  async function loadData() {
    setLoading(true);
    try {
      const resp = await getDashboardAggregates(filters);
      setData(resp);
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  const figureParams = { ...filters };
  const figures = [
    { title: "Distribution des notes", view: "histogram" },
    { title: "Performance", view: "boxplot" },
    { title: "Performance par sexe", view: "boxplot_by_sex" },
    { title: "Répartition Réussite/Echec", view: "donut" },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Vue globale (Dashboard)</h1>

      <div className="grid gap-4 lg:grid-cols-4 mb-6">
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
        <select
          value={filters.semestre}
          onChange={(e) => setFilters({ ...filters, semestre: e.target.value })}
          className="border rounded-lg px-3 py-2"
        >
          <option value="">Semestre</option>
          {options.semestres?.map((semestre) => (
            <option key={semestre} value={semestre}>{semestre}</option>
          ))}
        </select>
        <button
          onClick={loadData}
          className="inline-flex items-center justify-center rounded-lg bg-blue-700 px-4 py-2 text-white hover:bg-blue-800 transition"
        >
          Charger
        </button>
      </div>

      {loading && <div className="mb-4 text-sm text-gray-600">Chargement des données...</div>}

      {data ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {metricDefinitions.map((metric) => (
              <div key={metric.field} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="text-sm text-slate-500 mb-2">{metric.label}</div>
                <div className="text-3xl font-semibold text-slate-900">{metric.format(data[metric.field])}</div>
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2 mb-8">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Top 10 des UEs</h2>
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
                    {data.top10?.slice(0, 8).map((row, index) => (
                      <tr key={index} className="border-t border-slate-200">
                        <td className="px-3 py-2">{row.ue || row.nom || "-"}</td>
                        <td className="px-3 py-2">{row.moyenne?.toFixed?.(2) ?? row.moyenne ?? "-"}</td>
                        <td className="px-3 py-2">{row.taux_reussite != null ? `${row.taux_reussite.toFixed(1)} %` : "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Bottom 10 des UEs</h2>
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
                    {data.bottom10?.slice(0, 8).map((row, index) => (
                      <tr key={index} className="border-t border-slate-200">
                        <td className="px-3 py-2">{row.ue || row.nom || "-"}</td>
                        <td className="px-3 py-2">{row.moyenne?.toFixed?.(2) ?? row.moyenne ?? "-"}</td>
                        <td className="px-3 py-2">{row.taux_reussite != null ? `${row.taux_reussite.toFixed(1)} %` : "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {figures.map((figure) => (
              <div key={figure.view} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-3 text-sm font-semibold text-slate-600">{figure.title}</div>
                <img
                  src={getFigureUrl(figure.view, figureParams)}
                  alt={figure.title}
                  className="h-72 w-full rounded-xl object-contain border border-slate-200 bg-slate-50"
                />
              </div>
            ))}
          </div>
        </>
      ) : (
        !loading && <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">Aucune donnée chargée.</div>
      )}
    </div>
  );
}
