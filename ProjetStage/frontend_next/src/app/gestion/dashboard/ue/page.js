"use client";
import { useState } from "react";
import { getUEStats, getFigureUrl } from "@/services/eplApi";

const metrics = [
  { label: "Moyenne", field: "moyenne" },
  { label: "Taux de réussite", field: "taux_reussite", percent: true },
  { label: "Effectif", field: "effectif" },
  { label: "Min", field: "min_note" },
  { label: "Max", field: "max_note" },
  { label: "Médiane", field: "mediane_note" },
  { label: "Q1", field: "q1_note" },
  { label: "Q3", field: "q3_note" },
  { label: "IQR", field: "iqr_note" },
];

export default function VueUE() {
  const [code, setCode] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!code) return;
    setLoading(true);
    try {
      const res = await getUEStats(code);
      setData(res);
    } catch (e) {
      console.error(e);
      setData(null);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Vue UE</h1>
      <div className="grid gap-4 md:grid-cols-[1fr_auto] items-end mb-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Code de l’UE</label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="UE101"
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>
        <button
          onClick={load}
          className="inline-flex items-center justify-center rounded-lg bg-blue-700 px-5 py-2 text-white hover:bg-blue-800 transition"
        >
          Charger
        </button>
      </div>

      {loading && <div className="mb-4 text-sm text-gray-600">Chargement...</div>}

      {data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
            {metrics.map((metric) => (
              <div key={metric.field} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="text-sm text-slate-500 mb-2">{metric.label}</div>
                <div className="text-3xl font-semibold text-slate-900">
                  {data[metric.field] != null
                    ? metric.percent
                      ? `${Number(data[metric.field]).toFixed(1)} %`
                      : Number(data[metric.field]).toFixed(2)
                    : "-"}
                </div>
              </div>
            ))}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-sm text-slate-500 mb-2">Difficulté</div>
              <div className="text-3xl font-semibold text-slate-900">{data.isDifficile ? "Oui" : "Non"}</div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 text-sm font-semibold text-slate-600">Boxplot par sexe</div>
              <img
                src={getFigureUrl("boxplot_by_sex", { ue: code })}
                alt="Boxplot par sexe"
                className="h-72 w-full rounded-xl object-contain border border-slate-200 bg-slate-50"
              />
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 text-sm font-semibold text-slate-600">Moyenne par sexe</div>
              <img
                src={getFigureUrl("courbe_moyenne_par_sexe", { ue: code })}
                alt="Moyenne par sexe"
                className="h-72 w-full rounded-xl object-contain border border-slate-200 bg-slate-50"
              />
            </div>
          </div>
        </>
      ) : (
        !loading && <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">Saisissez un code UE et cliquez sur Charger.</div>
      )}
    </div>
  );
}
